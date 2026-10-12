import { useCallback, useEffect, useState } from "react";
import { servicoPorId } from "./config.js";
import * as store from "./lib/store.js";
import { ehFuturo } from "./lib/agenda.js";
import { paraMin } from "./lib/format.js";
import Home from "./screens/Home.jsx";
import Servicos from "./screens/Servicos.jsx";
import Horario from "./screens/Horario.jsx";
import Confirmar from "./screens/Confirmar.jsx";
import Pronto from "./screens/Pronto.jsx";
import MeusHorarios from "./screens/MeusHorarios.jsx";
import Equipe from "./screens/Equipe.jsx";

/* Rotas por hash (#/agendar/horario…): o botão voltar do celular funciona em todas as etapas
   e o app roda em qualquer hospedagem estática, sem configuração de servidor. */
const lerRota = () => window.location.hash.replace(/^#/, "") || "/";
const RASCUNHO_VAZIO = { barbeiroId: null, servicos: [], data: null, hora: null };

export default function App() {
  const [rota, setRota] = useState(lerRota);
  const [cliente, setCliente] = useState(store.obterCliente);
  const [agendamentos, setAgendamentos] = useState([]);
  const [rascunho, setRascunho] = useState(RASCUNHO_VAZIO);
  const [ultimo, setUltimo] = useState(null);

  const recarregar = useCallback(async () => setAgendamentos(await store.listarAgendamentos()), []);

  useEffect(() => {
    recarregar();
    const onHash = () => {
      setRota(lerRota());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    // Outra aba (ex.: agenda da equipe aberta junto) gravou algo: atualiza.
    window.addEventListener("storage", recarregar);
    return () => {
      window.removeEventListener("hashchange", onHash);
      window.removeEventListener("storage", recarregar);
    };
  }, [recarregar]);

  const navegar = (r, { substituir = false } = {}) => {
    if (substituir) {
      window.history.replaceState(null, "", `#${r}`);
      setRota(r);
      window.scrollTo(0, 0);
    } else {
      window.location.hash = r;
    }
  };

  // Etapas do agendamento sem barbeiro escolhido (ex.: página recarregada) voltam ao início.
  useEffect(() => {
    if (rota.startsWith("/agendar") && rota !== "/agendar/pronto" && !rascunho.barbeiroId) navegar("/", { substituir: true });
    if (rota === "/agendar/pronto" && !ultimo) navegar("/", { substituir: true });
  }, [rota, rascunho.barbeiroId, ultimo]);

  const atualizar = (parcial) => setRascunho((r) => ({ ...r, ...parcial }));

  const toggleServico = (id) =>
    setRascunho((r) => ({
      ...r,
      servicos: r.servicos.includes(id) ? r.servicos.filter((s) => s !== id) : [...r.servicos, id],
      hora: null, // a duração mudou; o horário escolhido pode não caber mais
    }));

  async function confirmar(dadosCliente) {
    const itens = rascunho.servicos.map(servicoPorId);
    const duracao = itens.reduce((s, x) => s + x.duracao, 0);
    const ini = paraMin(rascunho.hora);
    const ag = await store.criarAgendamento(
      {
        barbeiroId: rascunho.barbeiroId,
        data: rascunho.data,
        hora: rascunho.hora,
        servicos: rascunho.servicos,
        servicosNomes: itens.map((s) => s.nome),
        duracao,
        total: itens.reduce((s, x) => s + x.preco, 0),
        cliente: dadosCliente,
      },
      (todos) =>
        todos.some(
          (a) =>
            a.status !== "cancelado" &&
            a.barbeiroId === rascunho.barbeiroId &&
            a.data === rascunho.data &&
            ini < paraMin(a.hora) + a.duracao &&
            paraMin(a.hora) < ini + duracao
        )
    );
    await store.salvarCliente(dadosCliente);
    setCliente(dadosCliente);
    setUltimo(ag);
    await recarregar();
    setRascunho(RASCUNHO_VAZIO);
    navegar("/agendar/pronto", { substituir: true });
  }

  const proximo =
    cliente &&
    agendamentos
      .filter((a) => a.cliente.whatsapp === cliente.whatsapp && a.status === "confirmado" && ehFuturo(a))
      .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))[0];

  switch (rota) {
    case "/agendar/servicos":
      return rascunho.barbeiroId ? (
        <Servicos rascunho={rascunho} onToggle={toggleServico} onContinuar={() => navegar("/agendar/horario")} onVoltar={() => navegar("/")} />
      ) : null;
    case "/agendar/horario":
      return rascunho.barbeiroId ? (
        <Horario
          rascunho={rascunho}
          agendamentos={agendamentos}
          onChange={atualizar}
          onContinuar={() => navegar("/agendar/confirmar")}
          onVoltar={() => window.history.back()}
        />
      ) : null;
    case "/agendar/confirmar":
      return rascunho.barbeiroId && rascunho.hora ? (
        <Confirmar
          rascunho={rascunho}
          cliente={cliente}
          onConfirmar={async (c) => {
            try {
              await confirmar(c);
            } catch (e) {
              if (e.code === "OCUPADO") await recarregar();
              throw e;
            }
          }}
          onVoltar={() => window.history.back()}
          onTrocarHorario={() => { atualizar({ hora: null }); window.history.back(); }}
        />
      ) : null;
    case "/agendar/pronto":
      return <Pronto agendamento={ultimo} navegar={navegar} />;
    case "/meus":
      return (
        <MeusHorarios
          cliente={cliente}
          agendamentos={agendamentos}
          navegar={navegar}
          onCancelar={async (id) => { await store.atualizarStatus(id, "cancelado"); await recarregar(); }}
          onSalvarCliente={async (c) => setCliente(await store.salvarCliente(c))}
          onSair={async () => { await store.esquecerCliente(); setCliente(null); }}
        />
      );
    case "/equipe":
      return (
        <Equipe
          agendamentos={agendamentos}
          navegar={navegar}
          onStatus={async (id, status) => { await store.atualizarStatus(id, status); await recarregar(); }}
        />
      );
    default:
      return (
        <Home
          cliente={cliente}
          proximo={proximo}
          navegar={navegar}
          onEscolher={(barbeiroId) => {
            // Trocar de barbeiro mantém os serviços já escolhidos, mas não o horário.
            setRascunho((r) => ({ ...r, barbeiroId, hora: null }));
            navegar("/agendar/servicos");
          }}
        />
      );
  }
}
