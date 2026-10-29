import { CATEGORIAS, CATEGORIAS_UM_CORTE } from "../config.js";

/* Catálogo de serviços em uso. Começa com a lista de config.js e, com o
   Supabase ligado, é substituído pela tabela `servicos` ao abrir o app. */
let categorias = CATEGORIAS;

export const obterCategorias = () => categorias;
export const servicoPorId = (id) => {
  for (const c of categorias) {
    const s = c.servicos.find((x) => x.id === id);
    if (s) return s;
  }
  return undefined;
};
/* O serviço é um corte (de Cortes ou Combos)? Só pode haver um por agendamento. */
export const ehCorte = (id) =>
  categorias.some((c) => CATEGORIAS_UM_CORTE.includes(c.nome) && c.servicos.some((s) => s.id === id));
export const categoriaEhDeCorte = (cat) => CATEGORIAS_UM_CORTE.includes(cat.nome);

/* Marca/desmarca um serviço. Escolher um corte troca o corte anterior.
   Devolve a nova lista e, se houve troca, o serviço que saiu. */
export function alternarServico(selecionados, id) {
  if (selecionados.includes(id)) return { servicos: selecionados.filter((s) => s !== id), trocado: null };
  if (!ehCorte(id)) return { servicos: [...selecionados, id], trocado: null };
  const anterior = selecionados.find(ehCorte) ?? null;
  // O corte vai sempre na frente: "Degradê + Sobrancelha", nunca o contrário.
  return { servicos: [id, ...selecionados.filter((s) => !ehCorte(s))], trocado: anterior && servicoPorId(anterior) };
}

export function definirCategorias(novas) {
  if (novas?.length) categorias = novas;
}
