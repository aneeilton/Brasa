/* ============================================================
   Camada de dados.
   Hoje grava no próprio aparelho (localStorage) para o protótipo
   funcionar sem servidor. Todas as funções são assíncronas para
   que a troca por um backend (ex.: Supabase) seja feita só aqui,
   sem mexer nas telas.
   ============================================================ */

const K_CLIENTE = "stark.cliente";
const K_AGENDAMENTOS = "stark.agendamentos";

const ler = (k, padrao) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : padrao;
  } catch {
    return padrao;
  }
};
const gravar = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {
    throw new Error("Não foi possível salvar neste aparelho. Verifique se o navegador está em modo privado.");
  }
};

const novoId = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

/* ---------- Cliente (cadastro único) ---------- */
export const obterCliente = () => ler(K_CLIENTE, null);
export async function salvarCliente(cliente) {
  gravar(K_CLIENTE, cliente);
  return cliente;
}
export async function esquecerCliente() {
  localStorage.removeItem(K_CLIENTE);
}

/* ---------- Agendamentos ---------- */
export async function listarAgendamentos() {
  return ler(K_AGENDAMENTOS, []);
}

export async function criarAgendamento(dados, conflita) {
  const todos = ler(K_AGENDAMENTOS, []);
  // Revalida no momento de gravar: o horário pode ter sido tomado enquanto o cliente decidia.
  if (conflita(todos)) {
    const e = new Error("Esse horário acabou de ser reservado. Escolha outro, por favor.");
    e.code = "OCUPADO";
    throw e;
  }
  const ag = { id: novoId(), status: "confirmado", criadoEm: new Date().toISOString(), ...dados };
  gravar(K_AGENDAMENTOS, [...todos, ag]);
  return ag;
}

export async function atualizarStatus(id, status) {
  const todos = ler(K_AGENDAMENTOS, []).map((a) => (a.id === id ? { ...a, status } : a));
  gravar(K_AGENDAMENTOS, todos);
}
