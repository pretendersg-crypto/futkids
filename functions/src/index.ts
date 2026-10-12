// Servidor do FutKids (Cloud Functions 2ª geração, região São Paulo). Só o servidor muda o plano
// (grátis/pago) de uma escolinha ou família: as regras do Firestore recusam essa mudança vinda do app.
//
//  criarPagamento      (o app chama)  cria a assinatura mensal no cartão ou o pagamento avulso
//                                     (Pix, cartão, boleto) no Mercado Pago e devolve o link
//  avisoMercadoPago    (o MP chama)   confere o aviso (x-signature), consulta o pagamento no MP e
//                                     aplica o plano (regras.ts)
//  cancelarAssinatura  (o app chama)  cancela a renovação automática (o plano vale até o fim do período)
//  vencerPlanos        (todo dia)     plano vencido volta ao grátis
//  contarAtletas       (Firestore)    conta os atletas da escolinha e desfaz entrada acima do limite
import { createHmac, timingSafeEqual } from 'node:crypto'
import { initializeApp } from 'firebase-admin/app'
import { FieldValue, getFirestore, type DocumentReference } from 'firebase-admin/firestore'
import { setGlobalOptions } from 'firebase-functions/v2'
import { onDocumentWritten } from 'firebase-functions/v2/firestore'
import { HttpsError, onCall, onRequest } from 'firebase-functions/v2/https'
import { onSchedule } from 'firebase-functions/v2/scheduler'
import { onObjectDeleted, onObjectFinalized } from 'firebase-functions/v2/storage'
import { getStorage } from 'firebase-admin/storage'
import { defineSecret, defineString } from 'firebase-functions/params'
import { logger } from 'firebase-functions'
import * as mp from './mercadoPago.js'
import {
  aplicarEvento,
  cabeNoEspaco,
  videoDoArquivo,
  direitoGratis,
  lerCabecalhoAssinatura,
  lerReferencia,
  limitesDe,
  manifestoDaAssinatura,
  montarReferencia,
  planoDoCatalogo,
  precoDe,
  venceu,
  type Alvo,
  type Direito,
  type EventoPagamento,
  type Forma,
  type Periodo,
} from './regras.js'

initializeApp()
const db = getFirestore()
setGlobalOptions({ region: 'southamerica-east1', maxInstances: 5 })

const MP_TOKEN = defineSecret('MP_ACCESS_TOKEN')
const MP_SEGREDO_AVISO = defineSecret('MP_WEBHOOK_SECRET')
/** Endereço do app publicado (para onde o Mercado Pago devolve a pessoa) */
const URL_APP = defineString('URL_APP', { default: 'https://pretendersg-crypto.github.io/futkids' })

const colecaoDe = (alvo: Alvo) => (alvo === 'escolinha' ? 'escolinhas' : 'familias')

function direitoDoDoc(alvo: Alvo, dados: FirebaseFirestore.DocumentData | undefined): Direito {
  if (!dados) return direitoGratis(alvo)
  return {
    plano: String(dados.plano ?? 'gratis'),
    limites: dados.limites ?? limitesDe(alvo, 'gratis'),
    validoAte: typeof dados.validoAte === 'number' ? dados.validoAte : null,
    renovacaoAutomatica: dados.renovacaoAutomatica === true,
    assinatura: (dados.assinatura as string | undefined) ?? null,
  }
}

const camposDoDireito = (d: Direito) => ({
  plano: d.plano,
  limites: d.limites,
  validoAte: d.validoAte,
  renovacaoAutomatica: d.renovacaoAutomatica,
  assinatura: d.assinatura ?? null,
})

/** Quem pode pagar: o dono da escolinha, ou um responsável da família */
async function podePagar(alvo: Alvo, id: string, uid: string): Promise<boolean> {
  const d = (await db.collection(colecaoDe(alvo)).doc(id).get()).data()
  if (!d) return false
  return alvo === 'escolinha' ? (d.donos as string[] | undefined)?.includes(uid) === true : (d.responsaveis as string[] | undefined)?.includes(uid) === true
}

// ---------- criar pagamento ----------

export const criarPagamento = onCall({ secrets: [MP_TOKEN] }, async (req) => {
  const auth = req.auth
  if (!auth || auth.token.firebase.sign_in_provider === 'anonymous') throw new HttpsError('unauthenticated', 'Entre na conta.')
  const { alvo, id, plano, periodo, forma } = (req.data ?? {}) as { alvo: Alvo; id: string; plano: string; periodo: Periodo; forma: Forma }
  if (alvo !== 'escolinha' && alvo !== 'familia') throw new HttpsError('invalid-argument', 'Alvo inválido.')
  if (periodo !== 'mensal' && periodo !== 'anual') throw new HttpsError('invalid-argument', 'Período inválido.')
  if (forma !== 'assinatura' && forma !== 'avulso') throw new HttpsError('invalid-argument', 'Forma inválida.')
  if (forma === 'assinatura' && periodo !== 'mensal') throw new HttpsError('invalid-argument', 'A assinatura automática é mensal.')
  const valor = precoDe(alvo, plano, periodo)
  if (valor === null) throw new HttpsError('invalid-argument', 'Plano indisponível.')
  if (!(await podePagar(alvo, id, auth.uid))) throw new HttpsError('permission-denied', 'Só o dono da escolinha (ou um responsável da família) pode assinar.')
  const email = auth.token.email
  if (!email) throw new HttpsError('failed-precondition', 'A conta precisa de um e-mail para o Mercado Pago.')

  const referencia = montarReferencia({ alvo, id, plano, periodo, forma })
  const nome = `FutKids ${planoDoCatalogo(alvo, plano)!.nome} (${periodo})`
  const voltarPara = `${URL_APP.value()}/${alvo === 'escolinha' ? 'treinador' : 'conta'}?pagamento=voltou`
  const projeto = process.env.GCLOUD_PROJECT
  const avisarEm = `https://southamerica-east1-${projeto}.cloudfunctions.net/avisoMercadoPago`

  const r =
    forma === 'assinatura'
      ? await mp.criarAssinatura(MP_TOKEN.value(), { motivo: nome, referencia, email, valor, voltarPara })
      : await mp.criarPagamentoAvulso(MP_TOKEN.value(), { titulo: nome, referencia, email, valor, avisarEm, voltarPara, maxParcelas: periodo === 'anual' ? 12 : 1 })

  await db.collection('pagamentos').add({ referencia, alvo, id, plano, periodo, forma, valor, uid: auth.uid, mpId: r.id, status: 'criado', criadoEm: Date.now() })
  return { link: r.link }
})

// ---------- aviso do Mercado Pago ----------

function avisoAutentico(req: { headers: Record<string, string | string[] | undefined> }, dataId: string): boolean {
  const cab = lerCabecalhoAssinatura(String(req.headers['x-signature'] ?? ''))
  const requestId = String(req.headers['x-request-id'] ?? '')
  if (!cab || !requestId) return false
  const esperado = createHmac('sha256', MP_SEGREDO_AVISO.value()).update(manifestoDaAssinatura(dataId, requestId, cab.ts)).digest('hex')
  const a = Buffer.from(esperado)
  const b = Buffer.from(cab.v1)
  return a.length === b.length && timingSafeEqual(a, b)
}

/** Aplica um evento ao plano (em transação; o mesmo aviso repetido não soma duas vezes) */
async function aplicar(ev: EventoPagamento, chaveUnica: string) {
  const ref = db.collection(colecaoDe(ev.ref.alvo)).doc(ev.ref.id) as DocumentReference
  const marca = db.collection('pagamentosAplicados').doc(chaveUnica)
  await db.runTransaction(async (tx) => {
    if ((await tx.get(marca)).exists) return
    const doc = await tx.get(ref)
    if (!doc.exists) return logger.warn('Pagamento de alvo que não existe', ev.ref)
    const novo = aplicarEvento(direitoDoDoc(ev.ref.alvo, doc.data()), ev)
    if (!novo) return logger.error('Evento recusado (valor ou plano)', ev)
    tx.update(ref, camposDoDireito(novo))
    tx.set(marca, { em: Date.now(), tipo: ev.tipo, ref: montarReferencia(ev.ref) })
  })
}

export const avisoMercadoPago = onRequest({ secrets: [MP_TOKEN, MP_SEGREDO_AVISO] }, async (req, res) => {
  const tipo = String(req.body?.type ?? req.query.type ?? req.query.topic ?? '')
  const dataId = String(req.body?.data?.id ?? req.query['data.id'] ?? req.query.id ?? '')
  if (!tipo || !dataId) {
    res.status(200).send('ok')
    return
  }
  if (!avisoAutentico(req, dataId)) {
    logger.warn('Aviso do Mercado Pago com assinatura inválida', { tipo, dataId })
    res.status(401).send('assinatura inválida')
    return
  }
  try {
    const token = MP_TOKEN.value()
    if (tipo === 'payment') {
      const p = await mp.lerPagamento(token, dataId)
      const ref = lerReferencia(p.external_reference)
      // Cobranças da assinatura chegam pelos avisos de assinatura (abaixo)
      if (ref?.forma === 'avulso' && p.status === 'approved') {
        await aplicar({ tipo: 'avulso-aprovado', ref, valor: p.transaction_amount, em: Date.parse(p.date_approved ?? '') || Date.now() }, `pagamento-${p.id}`)
      }
    } else if (tipo === 'subscription_preapproval' || tipo === 'subscription_authorized_payment') {
      const idAssinatura = tipo === 'subscription_preapproval' ? dataId : (await mp.lerCobrancaDaAssinatura(token, dataId)).preapproval_id
      const a = await mp.lerAssinatura(token, idAssinatura)
      const ref = lerReferencia(a.external_reference)
      if (ref) {
        if (a.status === 'authorized' && a.next_payment_date) {
          const proxima = Date.parse(a.next_payment_date)
          await aplicar({ tipo: 'assinatura-ativa', ref, assinatura: a.id, proximaCobranca: proxima }, `assinatura-${a.id}-${proxima}`)
        } else if (a.status === 'cancelled' || a.status === 'paused') {
          await aplicar({ tipo: 'assinatura-parada', ref, assinatura: a.id }, `assinatura-${a.id}-${a.status}`)
        }
      }
    }
    res.status(200).send('ok')
  } catch (erro) {
    logger.error('Falha ao tratar aviso do Mercado Pago', erro)
    // 500: o Mercado Pago tenta de novo mais tarde
    res.status(500).send('erro')
  }
})

// ---------- cancelar a renovação ----------

export const cancelarAssinatura = onCall({ secrets: [MP_TOKEN] }, async (req) => {
  const auth = req.auth
  if (!auth || auth.token.firebase.sign_in_provider === 'anonymous') throw new HttpsError('unauthenticated', 'Entre na conta.')
  const { alvo, id } = (req.data ?? {}) as { alvo: Alvo; id: string }
  if ((alvo !== 'escolinha' && alvo !== 'familia') || !(await podePagar(alvo, id, auth.uid))) throw new HttpsError('permission-denied', 'Sem permissão.')
  const ref = db.collection(colecaoDe(alvo)).doc(id)
  const assinatura = (await ref.get()).data()?.assinatura as string | undefined
  if (!assinatura) throw new HttpsError('failed-precondition', 'Não há assinatura automática.')
  await mp.cancelarAssinatura(MP_TOKEN.value(), assinatura)
  await ref.update({ renovacaoAutomatica: false })
  return { ok: true }
})

// ---------- vencimento ----------

export const vencerPlanos = onSchedule({ schedule: 'every day 03:00', timeZone: 'America/Sao_Paulo' }, async () => {
  const agora = Date.now()
  for (const alvo of ['escolinha', 'familia'] as const) {
    const vencidos = await db.collection(colecaoDe(alvo)).where('validoAte', '<', agora).get()
    for (const doc of vencidos.docs) {
      if (venceu(direitoDoDoc(alvo, doc.data()), agora)) {
        await doc.ref.update(camposDoDireito(direitoGratis(alvo)))
        logger.info('Plano vencido voltou ao grátis', { alvo, id: doc.id })
      }
    }
  }
})

// ---------- espaço dos vídeos do treinador ----------

/** Vídeo novo: soma o espaço usado; se passou do plano, apaga o arquivo e o registro dele */
export const contarVideoNovo = onObjectFinalized(async (evento) => {
  const arquivo = evento.data
  const video = videoDoArquivo(arquivo.name)
  if (!video) return
  const escolinha = db.collection('escolinhas').doc(video.escolinha)
  const tamanho = Number(arquivo.size ?? 0)
  const passou = await db.runTransaction(async (tx) => {
    const d = (await tx.get(escolinha)).data()
    if (!d) return true
    const usado = Number(d.contagem?.videosBytes ?? 0)
    const limite = Number(d.limites?.videosMB ?? limitesDe('escolinha', 'gratis').videosMB)
    if (!cabeNoEspaco(usado, tamanho, limite)) return true
    tx.update(escolinha, { 'contagem.videosBytes': usado + tamanho })
    return false
  })
  if (passou) {
    logger.info('Vídeo acima do espaço do plano foi apagado', { arquivo: arquivo.name })
    await getStorage().bucket(arquivo.bucket).file(arquivo.name).delete({ ignoreNotFound: true })
    await db.doc(video.documento).delete()
  }
})

/** Vídeo apagado: devolve o espaço */
export const contarVideoApagado = onObjectDeleted(async (evento) => {
  const arquivo = evento.data
  const video = videoDoArquivo(arquivo.name)
  if (!video) return
  const tamanho = Number(arquivo.size ?? 0)
  await db
    .collection('escolinhas')
    .doc(video.escolinha)
    .update({ 'contagem.videosBytes': FieldValue.increment(-tamanho) })
    .catch(() => undefined)
})

// ---------- limite de atletas da escolinha ----------

export const contarAtletas = onDocumentWritten('escolinhas/{e}/turmas/{t}/membros/{m}', async (evento) => {
  const { e, t, m } = evento.params
  const escolinha = db.collection('escolinhas').doc(e)
  const dados = (await escolinha.get()).data()
  if (!dados) return
  let total = 0
  for (const turma of Object.keys((dados.turmas as Record<string, string> | undefined) ?? {})) {
    total += (await escolinha.collection('turmas').doc(turma).collection('membros').count().get()).data().count
  }
  const limite = Number(dados.limites?.atletas ?? limitesDe('escolinha', 'gratis').atletas)
  const criou = !evento.data?.before.exists && evento.data?.after.exists
  if (criou && total > limite) {
    // Acima do limite do plano: desfaz a entrada (e tira a turma do atleta da família)
    const membro = evento.data!.after.data()!
    await escolinha.collection('turmas').doc(t).collection('membros').doc(m).delete()
    if (membro.atleta) {
      const atleta = db.collection('atletas').doc(String(membro.atleta))
      await atleta.update({ turmas: FieldValue.arrayRemove(t), [`turmasNomes.${t}`]: FieldValue.delete() })
      const restantes = ((await atleta.get()).data()?.turmas as string[] | undefined) ?? []
      if (restantes.length === 0) await atleta.update({ escolinha: null, escolinhaNome: null, autorizacao: null })
    }
    total -= 1
    logger.info('Atleta acima do limite do plano foi recusado', { e, t, m, limite })
  }
  await escolinha.update({ 'contagem.atletas': total })
})
