/* Assinaturas mensais com renovação automática.
   O ciclo recomeça todo mês no dia em que a assinatura começou (31/01 → 28/02 → 31/03…),
   igual à regra do banco (supabase/schema.sql, função _ciclo). */
import { isoData } from "./format.js";

export function cicloAtual(inicio, hoje) {
  const [y, m, d] = inicio.split("-").map(Number);
  const mais = (k) => {
    const ultimo = new Date(y, m - 1 + k + 1, 0).getDate();
    return isoData(new Date(y, m - 1 + k, Math.min(d, ultimo)));
  };
  let k = 0;
  while (mais(k + 1) <= hoje) k++;
  return { cicloInicio: mais(k), renovaEm: mais(k + 1) };
}

/* Resumo de uma assinatura a partir dos agendamentos (modo demonstração). */
export function resumoAssinatura(a, plano, agendamentos, hoje) {
  const { cicloInicio, renovaEm } = cicloAtual(a.inicio, hoje);
  const usos = agendamentos.filter(
    (ag) => ag.cliente?.whatsapp === a.whatsapp && ag.status === "concluido" &&
      ag.data >= cicloInicio && ag.data < renovaEm && ag.servicos.some((s) => plano.servicos.includes(s))
  ).length;
  return { ...a, planoId: plano.id, plano: plano.nome, preco: plano.preco, limite: plano.limite, usos, cicloInicio, renovaEm };
}
