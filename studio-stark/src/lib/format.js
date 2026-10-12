export const moeda = (n) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const duracao = (min) => {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
};

const pad = (n) => String(n).padStart(2, "0");

/* Datas trafegam como "AAAA-MM-DD" e horas como "HH:mm" (horário local). */
export const isoData = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const deIsoData = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const paraMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
export const deMin = (min) => `${pad(Math.floor(min / 60))}:${pad(min % 60)}`;

export const dataLonga = (iso) =>
  deIsoData(iso).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

export const dataCurta = (iso) =>
  deIsoData(iso).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" }).replace(".", "");

export const capitalizar = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/* WhatsApp: guarda só dígitos (DDD + número); exibe com máscara. */
export const soDigitos = (s) => s.replace(/\D/g, "");
export const mascaraTelefone = (s) => {
  const d = soDigitos(s).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const primeiroNome = (nome) => nome.trim().split(/\s+/)[0];
