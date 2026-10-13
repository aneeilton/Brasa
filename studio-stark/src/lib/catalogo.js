import { CATEGORIAS } from "../config.js";

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
export function definirCategorias(novas) {
  if (novas?.length) categorias = novas;
}
