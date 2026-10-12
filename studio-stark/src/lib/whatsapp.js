import { BARBEARIA, barbeiroPorId } from "../config.js";
import { dataLonga, primeiroNome } from "./format.js";

/* Abre o WhatsApp com a mensagem pronta (envio manual, sem custo). */
export function linkLembrete(ag) {
  const barbeiro = barbeiroPorId(ag.barbeiroId)?.nome ?? "";
  const texto =
    `Olá, ${primeiroNome(ag.cliente.nome)}! Passando para lembrar do seu horário no ${BARBEARIA.nome}: ` +
    `${dataLonga(ag.data)}, às ${ag.hora}, com ${barbeiro} (${ag.servicosNomes.join(", ")}). ` +
    `Se não puder vir, é só responder esta mensagem. Até lá!`;
  return `https://wa.me/55${ag.cliente.whatsapp}?text=${encodeURIComponent(texto)}`;
}

export const linkBarbearia = (texto = "") =>
  BARBEARIA.whatsapp ? `https://wa.me/${BARBEARIA.whatsapp}${texto ? `?text=${encodeURIComponent(texto)}` : ""}` : null;
