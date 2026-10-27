import { FUNCIONAMENTO } from "../config.js";
import { isoData, paraMin, deMin } from "./format.js";

export const abreNoDia = (date) => FUNCIONAMENTO.diasDaSemana.includes(date.getDay());

/* "Agora" no relógio da barbearia (fuso da Bahia), mesmo que o celular esteja em outro fuso.
   Devolve um Date cujos campos locais (dia, hora, minuto) são os da barbearia. */
export function agoraNaBarbearia(d = new Date()) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: FUNCIONAMENTO.fuso, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit",
    }).formatToParts(d).map((x) => [x.type, x.value])
  );
  return new Date(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute);
}

/* Primeiro minuto em que ainda se pode começar um atendimento hoje. */
const limiteHoje = (agora) => agora.getHours() * 60 + agora.getMinutes() + FUNCIONAMENTO.antecedenciaMin;
/* Um horário cabe no período? Com `ultimoInicio`, vale o horário de INÍCIO
   (pode terminar depois); sem ele, o atendimento precisa terminar até o `fim`. */
const cabe = (p, t, duracaoMin) =>
  p.ultimoInicio ? t <= paraMin(p.ultimoInicio) : t + duracaoMin <= paraMin(p.fim);
const ultimoInicio = () => {
  const p = FUNCIONAMENTO.periodos[FUNCIONAMENTO.periodos.length - 1];
  return p.ultimoInicio ? paraMin(p.ultimoInicio) : paraMin(p.fim) - FUNCIONAMENTO.intervaloMin;
};

/* Próximos dias em que a barbearia abre. Hoje só entra se ainda houver horário possível. */
export function diasDisponiveis(hoje = agoraNaBarbearia()) {
  const dias = [];
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  for (let i = 0; i <= FUNCIONAMENTO.diasAFrente; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (!abreNoDia(d)) continue;
    if (i === 0 && limiteHoje(hoje) > ultimoInicio()) continue;
    dias.push(isoData(d));
  }
  return dias;
}

const sobrepoe = (aIni, aFim, bIni, bFim) => aIni < bFim && bIni < aFim;

/* Horários LIVRES e FUTUROS para um barbeiro/dia/duração, agrupados por período.
   Horários que já passaram (ou estão a menos de 1 h) e os ocupados não aparecem. */
export function horariosDoDia({ data, barbeiroId, duracaoMin, agendamentos, agora = agoraNaBarbearia() }) {
  const ocupados = agendamentos
    .filter((a) => a.data === data && a.barbeiroId === barbeiroId && a.status !== "cancelado")
    .map((a) => [paraMin(a.hora), paraMin(a.hora) + a.duracao]);

  const ehHoje = data === isoData(agora);
  const limite = limiteHoje(agora);

  return FUNCIONAMENTO.periodos.map((p) => {
    const ini = paraMin(p.inicio);
    const horarios = [];
    for (let t = ini; cabe(p, t, duracaoMin); t += FUNCIONAMENTO.intervaloMin) {
      const passou = ehHoje && t < limite;
      const conflito = ocupados.some(([oi, of]) => sobrepoe(t, t + duracaoMin, oi, of));
      if (passou || conflito) continue;
      horarios.push({ hora: deMin(t), livre: true });
    }
    return { nome: p.nome, horarios };
  });
}

export const temHorarioLivre = (args) =>
  horariosDoDia(args).some((p) => p.horarios.some((h) => h.livre));

/* O agendamento ainda não terminou? */
export function ehFuturo(ag, agora = agoraNaBarbearia()) {
  const [y, m, d] = ag.data.split("-").map(Number);
  const [h, mi] = ag.hora.split(":").map(Number);
  return new Date(y, m - 1, d, h, mi + ag.duracao) > agora;
}
