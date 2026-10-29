/* ============================================================
   Painel do gestor — cálculo das métricas a partir dos agendamentos.
   Função pura: recebe a lista e devolve os números prontos para a tela.
   ============================================================ */
import { BARBEIROS, FUNCIONAMENTO } from "../config.js";
import { servicoPorId } from "./catalogo.js";
import { abreNoDia } from "./agenda.js";
import { deIsoData, isoData, paraMin } from "./format.js";

const DIA_MS = 86400000;
const somaDias = (iso, n) => {
  const d = deIsoData(iso);
  d.setDate(d.getDate() + n);
  return isoData(d);
};

/* Período escolhido: "semana" (segunda a domingo) ou "mes", deslocado em `offset`.
   Se o período está em andamento, compara com o MESMO trecho do período anterior
   (ex.: 1º a 12 de outubro × 1º a 12 de setembro), senão a comparação engana. */
export function periodo(tipo, offset = 0, hoje = new Date()) {
  const p = periodoCheio(tipo, offset, hoje);
  const h = isoData(hoje);
  if (h >= p.de && h <= p.ate) {
    const decorridos = Math.round((deIsoData(h) - deIsoData(p.de)) / DIA_MS);
    const corte = somaDias(p.antDe, decorridos);
    if (corte < p.antAte) p.antAte = corte;
    p.parcial = true;
  }
  return p;
}

function periodoCheio(tipo, offset, hoje) {
  if (tipo === "semana") {
    const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + offset * 7);
    const seg = new Date(base);
    seg.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    const de = isoData(seg);
    const ate = somaDias(de, 6);
    return { tipo, offset, de, ate, antDe: somaDias(de, -7), antAte: somaDias(de, -1) };
  }
  const ini = new Date(hoje.getFullYear(), hoje.getMonth() + offset, 1);
  const fim = new Date(ini.getFullYear(), ini.getMonth() + 1, 0);
  const antIni = new Date(ini.getFullYear(), ini.getMonth() - 1, 1);
  const antFim = new Date(ini.getFullYear(), ini.getMonth(), 0);
  return { tipo, offset, de: isoData(ini), ate: isoData(fim), antDe: isoData(antIni), antAte: isoData(antFim) };
}

/* Janela de dados que o painel precisa: período anterior + 180 dias de histórico de clientes. */
export function janela(p, hoje = new Date()) {
  const hist = isoData(new Date(hoje.getTime() - 180 * DIA_MS));
  return { de: p.antDe < hist ? p.antDe : hist, ate: p.ate > isoData(hoje) ? p.ate : isoData(hoje) };
}

const valido = (a) => a.status === "confirmado" || a.status === "concluido";
const fimDe = (a) => {
  const d = deIsoData(a.data);
  d.setMinutes(paraMin(a.hora) + a.duracao);
  return d;
};

function diasAbertos(de, ate) {
  const dias = [];
  for (let d = de; d <= ate; d = somaDias(d, 1)) if (abreNoDia(deIsoData(d))) dias.push(d);
  return dias;
}

const minutosPorDia = () =>
  FUNCIONAMENTO.periodos.reduce((s, p) => s + paraMin(p.fim) - paraMin(p.inicio), 0);

export const HORAS_PICO = FUNCIONAMENTO.periodos.flatMap((p) => {
  const h = [];
  const ate = p.ultimoInicio ? paraMin(p.ultimoInicio) + 1 : paraMin(p.fim);
  for (let t = paraMin(p.inicio); t < ate; t += 60) h.push(t / 60);
  return h;
});

export function calcularPainel({ lista, p, agora = new Date() }) {
  const hoje = isoData(agora);
  const noPeriodo = lista.filter((a) => a.data >= p.de && a.data <= p.ate);
  const noAnterior = lista.filter((a) => a.data >= p.antDe && a.data <= p.antAte);

  const soma = (xs) => xs.reduce((s, a) => s + a.total, 0);
  const concluidos = noPeriodo.filter((a) => a.status === "concluido");
  const validos = noPeriodo.filter(valido);
  const semFechamento = noPeriodo.filter((a) => a.status === "confirmado" && fimDe(a) <= agora);
  const futuros = noPeriodo.filter((a) => a.status === "confirmado" && fimDe(a) > agora);
  const faltas = noPeriodo.filter((a) => a.status === "faltou").length;
  const cancelados = noPeriodo.filter((a) => a.status === "cancelado").length;

  const dias = diasAbertos(p.de, p.ate);
  const capacidadeBarbeiro = dias.length * minutosPorDia();
  const ocupacao = (xs, nBarbeiros) => {
    const cap = capacidadeBarbeiro * nBarbeiros;
    return cap ? xs.reduce((s, a) => s + a.duracao, 0) / cap : 0;
  };

  const realizado = soma(concluidos);
  const anteriorRealizado = soma(noAnterior.filter((a) => a.status === "concluido"));
  const anteriorAtendimentos = noAnterior.filter((a) => a.status === "concluido").length;

  // Movimento por dia aberto (valor dos agendamentos válidos).
  const porDia = dias.map((data) => {
    const xs = validos.filter((a) => a.data === data);
    return { data, valor: soma(xs), qtd: xs.length, futuro: data > hoje };
  });

  const porBarbeiro = BARBEIROS.map((b) => {
    const xs = validos.filter((a) => a.barbeiroId === b.id);
    return {
      id: b.id,
      nome: b.nome,
      foto: b.foto,
      qtd: xs.length,
      valor: soma(xs),
      concluidos: xs.filter((a) => a.status === "concluido").length,
      realizado: soma(xs.filter((a) => a.status === "concluido")),
      ocupacao: ocupacao(xs, 1),
    };
  });

  // Serviços mais pedidos (preço atual do catálogo; nome gravado no agendamento como reserva).
  const mapaServ = new Map();
  for (const a of validos) {
    a.servicos.forEach((id, i) => {
      const s = mapaServ.get(id) ?? { id, nome: servicoPorId(id)?.nome ?? a.servicosNomes[i] ?? id, qtd: 0, valor: 0 };
      s.qtd += 1;
      s.valor += servicoPorId(id)?.preco ?? 0;
      mapaServ.set(id, s);
    });
  }
  const servicos = [...mapaServ.values()].sort((x, y) => y.qtd - x.qtd || y.valor - x.valor).slice(0, 6);

  // Horários de pico: agendamentos que começam em cada dia da semana × hora.
  const pico = FUNCIONAMENTO.diasDaSemana.map((dow) => ({
    dow,
    horas: HORAS_PICO.map((h) => ({
      h,
      qtd: validos.filter((a) => deIsoData(a.data).getDay() === dow && Math.floor(paraMin(a.hora) / 60) === h).length,
    })),
  }));

  // Clientes (agrupados pelo WhatsApp, que identifica a pessoa mesmo trocando de aparelho).
  const porCliente = new Map();
  for (const a of lista.filter(valido)) {
    const k = a.cliente?.whatsapp;
    if (!k) continue;
    const c = porCliente.get(k) ?? { nome: a.cliente.nome, whatsapp: k, primeira: a.data, ultima: null, visitas: 0, futuro: false };
    if (a.data < c.primeira) c.primeira = a.data;
    if (fimDe(a) > agora) c.futuro = true;
    else {
      c.visitas += 1;
      if (!c.ultima || a.data > c.ultima) {
        c.ultima = a.data;
        c.nome = a.cliente.nome;
      }
    }
    porCliente.set(k, c);
  }
  const noPeriodoZaps = new Set(validos.map((a) => a.cliente?.whatsapp).filter(Boolean));
  const novos = [...noPeriodoZaps].filter((k) => porCliente.get(k)?.primeira >= p.de).length;

  const limiteSumido = isoData(new Date(agora.getTime() - 30 * DIA_MS));
  const limiteAntigo = isoData(new Date(agora.getTime() - 150 * DIA_MS));
  const reativar = [...porCliente.values()]
    .filter((c) => !c.futuro && c.ultima && c.ultima <= limiteSumido && c.ultima >= limiteAntigo)
    .sort((x, y) => y.visitas - x.visitas || y.ultima.localeCompare(x.ultima))
    .slice(0, 20)
    .map((c) => ({ ...c, dias: Math.round((agora - deIsoData(c.ultima)) / DIA_MS) }));

  return {
    realizado,
    anteriorRealizado,
    previsto: soma(futuros),
    atendimentos: concluidos.length,
    anteriorAtendimentos,
    agendados: validos.length,
    ticket: concluidos.length ? realizado / concluidos.length : 0,
    ocupacao: ocupacao(validos, BARBEIROS.length),
    faltas,
    cancelados,
    taxaFaltas: concluidos.length + faltas ? faltas / (concluidos.length + faltas) : 0,
    semFechamento: semFechamento.length,
    porDia,
    porBarbeiro,
    servicos,
    pico,
    clientes: { total: noPeriodoZaps.size, novos, recorrentes: noPeriodoZaps.size - novos },
    reativar,
  };
}
