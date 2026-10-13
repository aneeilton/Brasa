import { FUNCIONAMENTO } from "../config.js";
import { isoData, paraMin, deMin } from "./format.js";

export const abreNoDia = (date) => FUNCIONAMENTO.diasDaSemana.includes(date.getDay());

/* Próximos dias em que a barbearia abre, a partir de hoje. */
export function diasDisponiveis(hoje = new Date()) {
  const dias = [];
  const base = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  for (let i = 0; i <= FUNCIONAMENTO.diasAFrente; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    if (abreNoDia(d)) dias.push(isoData(d));
  }
  return dias;
}

const sobrepoe = (aIni, aFim, bIni, bFim) => aIni < bFim && bIni < aFim;

/* Horários para um barbeiro/dia/duração, agrupados por período.
   Cada horário vem com `livre` para que a interface mostre os ocupados desabilitados. */
export function horariosDoDia({ data, barbeiroId, duracaoMin, agendamentos, agora = new Date() }) {
  const ocupados = agendamentos
    .filter((a) => a.data === data && a.barbeiroId === barbeiroId && a.status !== "cancelado")
    .map((a) => [paraMin(a.hora), paraMin(a.hora) + a.duracao]);

  const ehHoje = data === isoData(agora);
  const limite = agora.getHours() * 60 + agora.getMinutes() + FUNCIONAMENTO.antecedenciaMin;

  return FUNCIONAMENTO.periodos.map((p) => {
    const ini = paraMin(p.inicio);
    const fim = paraMin(p.fim);
    const horarios = [];
    for (let t = ini; t + duracaoMin <= fim; t += FUNCIONAMENTO.intervaloMin) {
      const passou = ehHoje && t < limite;
      const conflito = ocupados.some(([oi, of]) => sobrepoe(t, t + duracaoMin, oi, of));
      if (passou) continue;
      horarios.push({ hora: deMin(t), livre: !conflito });
    }
    return { nome: p.nome, horarios };
  });
}

export const temHorarioLivre = (args) =>
  horariosDoDia(args).some((p) => p.horarios.some((h) => h.livre));

/* O agendamento ainda não terminou? */
export function ehFuturo(ag, agora = new Date()) {
  const [y, m, d] = ag.data.split("-").map(Number);
  const [h, mi] = ag.hora.split(":").map(Number);
  return new Date(y, m - 1, d, h, mi + ag.duracao) > agora;
}
