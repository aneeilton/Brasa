import { BARBEARIA, barbeiroPorId } from "../config.js";

const pad = (n) => String(n).padStart(2, "0");
const ics = (data, hora, somaMin = 0) => {
  const [y, m, d] = data.split("-").map(Number);
  const [h, mi] = hora.split(":").map(Number);
  const dt = new Date(y, m - 1, d, h, mi + somaMin);
  return `${dt.getFullYear()}${pad(dt.getMonth() + 1)}${pad(dt.getDate())}T${pad(dt.getHours())}${pad(dt.getMinutes())}00`;
};

/* Gera um .ics simples — abre direto no Calendário do iPhone e no Google Agenda. */
export function baixarConvite(ag) {
  const barbeiro = barbeiroPorId(ag.barbeiroId)?.nome ?? "";
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Studio Stark//Agendamento//PT-BR",
    "BEGIN:VEVENT",
    `UID:${ag.id}@studiostark`,
    `DTSTAMP:${ics(ag.data, ag.hora)}`,
    `DTSTART:${ics(ag.data, ag.hora)}`,
    `DTEND:${ics(ag.data, ag.hora, ag.duracao)}`,
    `SUMMARY:${BARBEARIA.nome} · ${barbeiro}`,
    `DESCRIPTION:${ag.servicosNomes.join(", ")}`,
    BARBEARIA.endereco ? `LOCATION:${BARBEARIA.endereco}` : null,
    "BEGIN:VALARM",
    "TRIGGER:-PT1H",
    "ACTION:DISPLAY",
    "DESCRIPTION:Seu horário no Studio Stark é em 1 hora",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  const blob = new Blob([linhas.join("\r\n")], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "studio-stark.ics";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
