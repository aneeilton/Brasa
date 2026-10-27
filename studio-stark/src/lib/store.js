/* ============================================================
   Camada de dados.
   • Com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY definidos → Supabase
     (agenda compartilhada entre todos os aparelhos).
   • Sem eles → grava só neste aparelho (modo demonstração).
   As telas usam apenas as funções exportadas aqui.
   ============================================================ */
import { createClient } from "@supabase/supabase-js";
import { definirCategorias, servicoPorId } from "./catalogo.js";
import { paraMin } from "./format.js";

const URL_SB = import.meta.env.VITE_SUPABASE_URL;
const CHAVE_SB = import.meta.env.VITE_SUPABASE_ANON_KEY;
const sb = URL_SB && CHAVE_SB ? createClient(URL_SB, CHAVE_SB) : null;

export const remoto = !!sb;

const K_CLIENTE = "stark.cliente";
const K_AGENDAMENTOS = "stark.agendamentos";
const K_EQUIPE_PIN = "stark.equipe";

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

/* Mensagens amigáveis para os erros do servidor. */
const MENSAGENS = {
  HORARIO_OCUPADO: "Esse horário acabou de ser reservado. Escolha outro, por favor.",
  FORA_DO_HORARIO: "Esse horário está fora do funcionamento da barbearia.",
  FORA_DO_PRAZO: "Esse horário não está mais disponível. Escolha outro, por favor.",
  LIMITE_AGENDAMENTOS: "Você já tem 3 horários marcados. Para marcar outro, cancele um em “Meus horários”.",
  SERVICO_INVALIDO: "Algum serviço escolhido não está mais disponível. Volte e escolha de novo.",
  BARBEIRO_INVALIDO: "Esse barbeiro não está disponível no momento.",
  NOME_INVALIDO: "Digite nome e sobrenome.",
  WHATSAPP_INVALIDO: "Digite o WhatsApp com DDD.",
  EMAIL_INVALIDO: "Digite um e-mail válido.",
  NAO_ENCONTRADO: "Não encontramos esse agendamento. Ele pode já ter passado ou sido cancelado.",
};
function erro(e) {
  if (!e) return null;
  const codigo = Object.keys(MENSAGENS).find((k) => e.message?.includes(k));
  const err = new Error(
    codigo ? MENSAGENS[codigo] : "Não foi possível falar com a barbearia agora. Verifique sua internet e tente de novo."
  );
  err.code = codigo === "HORARIO_OCUPADO" || codigo === "FORA_DO_PRAZO" ? "OCUPADO" : codigo;
  return err;
}
async function rpc(nome, args) {
  const { data, error } = await sb.rpc(nome, args);
  if (error) throw erro(error);
  return data;
}

/* ---------- Catálogo ---------- */
export async function carregarCatalogo() {
  if (!sb) return;
  const { data, error } = await sb.from("servicos").select("*").order("ordem");
  if (error || !data?.length) return; // mantém a lista de config.js
  const grupos = [];
  for (const s of data) {
    let g = grupos.find((x) => x.nome === s.categoria);
    if (!g) grupos.push((g = { id: s.categoria, nome: s.categoria, servicos: [] }));
    g.servicos.push({ id: s.id, nome: s.nome, descricao: s.descricao, preco: Number(s.preco), duracao: s.duracao });
  }
  definirCategorias(grupos);
}

/* ---------- Cliente (cadastro único, guardado no aparelho) ---------- */
export const obterCliente = () => ler(K_CLIENTE, null);

export async function salvarCliente(cliente) {
  const atual = obterCliente();
  if (sb && atual?.token) {
    await rpc("atualizar_cliente", { p_token: atual.token, p_nome: cliente.nome, p_whatsapp: cliente.whatsapp, p_email: cliente.email });
  }
  const novo = { ...cliente, token: atual?.token };
  gravar(K_CLIENTE, novo);
  return novo;
}

export async function esquecerCliente() {
  localStorage.removeItem(K_CLIENTE);
}

/* ---------- Disponibilidade ---------- */
/* Horários ocupados entre duas datas (AAAA-MM-DD), sem dados pessoais. */
export async function ocupados(de, ate) {
  if (sb) {
    const linhas = await rpc("horarios_ocupados", { p_de: de, p_ate: ate });
    return (linhas ?? []).map((l) => ({
      barbeiroId: l.barbeiro_id,
      data: l.inicio.slice(0, 10),
      hora: l.inicio.slice(11, 16),
      duracao: paraMin(l.fim.slice(11, 16)) - paraMin(l.inicio.slice(11, 16)),
      status: "confirmado",
    }));
  }
  return ler(K_AGENDAMENTOS, []).filter((a) => a.status !== "cancelado" && a.data >= de && a.data <= ate);
}

/* ---------- Agendar ---------- */
export async function criarAgendamento({ barbeiroId, data, hora, servicos, cliente }) {
  const token = obterCliente()?.token ?? null;

  if (sb) {
    const r = await rpc("criar_agendamento", {
      p_token: token,
      p_nome: cliente.nome,
      p_whatsapp: cliente.whatsapp,
      p_email: cliente.email,
      p_barbeiro: barbeiroId,
      p_inicio: `${data}T${hora}:00`,
      p_servicos: servicos,
    });
    gravar(K_CLIENTE, { ...cliente, token: r.token });
    return normalizar(r.agendamento);
  }

  const itens = servicos.map(servicoPorId);
  const duracao = itens.reduce((s, x) => s + x.duracao, 0);
  const todos = ler(K_AGENDAMENTOS, []);
  const ini = paraMin(hora);
  const conflito = todos.some(
    (a) => a.status !== "cancelado" && a.barbeiroId === barbeiroId && a.data === data &&
      ini < paraMin(a.hora) + a.duracao && paraMin(a.hora) < ini + duracao
  );
  if (conflito) {
    const e = new Error(MENSAGENS.HORARIO_OCUPADO);
    e.code = "OCUPADO";
    throw e;
  }
  const ag = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    status: "confirmado",
    barbeiroId, data, hora, servicos, duracao,
    servicosNomes: itens.map((s) => s.nome),
    total: itens.reduce((s, x) => s + x.preco, 0),
    cliente,
  };
  gravar(K_AGENDAMENTOS, [...todos, ag]);
  gravar(K_CLIENTE, { ...cliente, token: obterCliente()?.token });
  return ag;
}

const normalizar = (a) => ({ ...a, total: Number(a.total) });

/* ---------- Meus horários ---------- */
export async function meusAgendamentos() {
  const c = obterCliente();
  if (!c) return [];
  if (sb) {
    if (!c.token) return [];
    return ((await rpc("meus_agendamentos", { p_token: c.token })) ?? []).map(normalizar);
  }
  return ler(K_AGENDAMENTOS, []).filter((a) => a.cliente.whatsapp === c.whatsapp);
}

/* Cartão fidelidade: quantos atendimentos CONCLUÍDOS este cliente tem
   (somando todos os aparelhos em que ele agendou com o mesmo WhatsApp). */
export async function minhaFidelidade() {
  const c = obterCliente();
  if (!c) return 0;
  if (sb) return c.token ? Number(await rpc("minha_fidelidade", { p_token: c.token })) || 0 : 0;
  return ler(K_AGENDAMENTOS, []).filter((a) => a.cliente.whatsapp === c.whatsapp && a.status === "concluido").length;
}

/* Para a equipe: { whatsapp: concluídos } dos clientes informados. */
export async function fidelidadeClientes(whatsapps) {
  const lista = [...new Set(whatsapps.filter(Boolean))];
  if (!lista.length) return {};
  if (sb) {
    const linhas = await rpc("fidelidade_clientes", { p_whatsapps: lista });
    return Object.fromEntries((linhas ?? []).map((l) => [l.whatsapp, l.concluidos]));
  }
  const mapa = {};
  for (const a of ler(K_AGENDAMENTOS, []))
    if (a.status === "concluido" && lista.includes(a.cliente.whatsapp)) mapa[a.cliente.whatsapp] = (mapa[a.cliente.whatsapp] ?? 0) + 1;
  return mapa;
}

export async function cancelarMeu(id) {
  if (sb) return rpc("cancelar_meu_agendamento", { p_token: obterCliente()?.token, p_id: id });
  return atualizarLocal(id, "cancelado");
}

/* ---------- Equipe ---------- */
export async function sessaoEquipe() {
  if (!sb) return sessionStorage.getItem(K_EQUIPE_PIN) === "1";
  const { data } = await sb.auth.getSession();
  if (!data.session) return false;
  const { data: ok } = await sb.rpc("is_equipe");
  return !!ok;
}

export async function entrarEquipe({ email, senha, pin, pinCorreto }) {
  if (!sb) {
    if (pin !== pinCorreto) throw new Error("PIN incorreto.");
    sessionStorage.setItem(K_EQUIPE_PIN, "1");
    return;
  }
  const { error } = await sb.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: senha });
  if (error) {
    if (error.code === "email_not_confirmed")
      throw new Error("Este e-mail ainda não foi confirmado no Supabase. Confirme o usuário em Authentication → Users.");
    if (error.code === "invalid_credentials")
      throw new Error("E-mail ou senha incorretos. Confira se o usuário existe em Authentication → Users e se a senha está certa.");
    if (error.status === 429) throw new Error("Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.");
    throw new Error("Não foi possível entrar agora. Verifique sua internet e tente de novo.");
  }
  const { data: ok } = await sb.rpc("is_equipe");
  if (!ok) {
    await sb.auth.signOut();
    throw new Error("Login certo, mas este e-mail não está liberado na agenda (tabela equipe do Supabase).");
  }
}

export async function sairEquipe() {
  if (!sb) return sessionStorage.removeItem(K_EQUIPE_PIN);
  await sb.auth.signOut();
}

/* Quem está logado pode ver o painel do negócio? (modo local: sim) */
export async function ehGestor() {
  if (!sb) return true;
  const { data } = await sb.rpc("is_gestor");
  return !!data;
}

const linhaParaAgendamento = (l) => ({
  id: l.id,
  barbeiroId: l.barbeiro_id,
  data: l.inicio.slice(0, 10),
  hora: l.inicio.slice(11, 16),
  duracao: paraMin(l.fim.slice(11, 16)) - paraMin(l.inicio.slice(11, 16)),
  servicos: l.servicos,
  servicosNomes: l.servicos_nomes,
  total: Number(l.total),
  status: l.status,
  cliente: l.clientes,
});

/* Todos os agendamentos entre duas datas (para o painel). Busca em páginas,
   porque o Supabase devolve no máximo 1000 linhas por consulta. */
export async function agendamentosEntre(de, ate) {
  if (!sb) return ler(K_AGENDAMENTOS, []).filter((a) => a.data >= de && a.data <= ate);
  const todas = [];
  const PAGINA = 1000;
  for (let i = 0; ; i += PAGINA) {
    const { data: linhas, error } = await sb
      .from("agendamentos")
      .select("id, barbeiro_id, inicio, fim, servicos, servicos_nomes, total, status, clientes(nome, whatsapp)")
      .gte("inicio", `${de}T00:00:00`)
      .lte("inicio", `${ate}T23:59:59`)
      .order("inicio")
      .range(i, i + PAGINA - 1);
    if (error) throw erro(error);
    todas.push(...linhas.map(linhaParaAgendamento));
    if (linhas.length < PAGINA) return todas;
  }
}

/* Agenda completa de um dia (com dados do cliente). */
export async function agendaDoDia(data) {
  if (!sb) return ler(K_AGENDAMENTOS, []).filter((a) => a.data === data);
  const { data: linhas, error } = await sb
    .from("agendamentos")
    .select("id, barbeiro_id, inicio, fim, servicos, servicos_nomes, total, status, clientes(nome, whatsapp, email)")
    .gte("inicio", `${data}T00:00:00`)
    .lte("inicio", `${data}T23:59:59`)
    .order("inicio");
  if (error) throw erro(error);
  return linhas.map(linhaParaAgendamento);
}

export async function atualizarStatus(id, status) {
  if (!sb) return atualizarLocal(id, status);
  const { error } = await sb.from("agendamentos").update({ status }).eq("id", id);
  if (error) throw erro(error);
}

function atualizarLocal(id, status) {
  gravar(K_AGENDAMENTOS, ler(K_AGENDAMENTOS, []).map((a) => (a.id === id ? { ...a, status } : a)));
}

