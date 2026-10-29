import { useCallback, useEffect, useState } from "react";
import * as store from "./lib/store.js";
import { alternarServico } from "./lib/catalogo.js";
import { ehFuturo } from "./lib/agenda.js";
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
  const [pronto, setPronto] = useState(!store.remoto);
  const [rota, setRota] = useState(lerRota);
  const [cliente, setCliente] = useState(store.obterCliente);
  const [meus, setMeus] = useState(null); // null = carregando
  const [fidelidade, setFidelidade] = useState(null);
  const [assinatura, setAssinatura] = useState(null);
  const [rascunho, setRascunho] = useState(RASCUNHO_VAZIO);
  const [ultimo, setUltimo] = useState(null);

  const recarregarMeus = useCallback(async () => {
    try {
      // O cartão fidelidade nunca derruba a lista de horários (ex.: banco ainda sem a função nova).
      const [lista, selos, plano] = await Promise.all([
        store.meusAgendamentos(),
        store.minhaFidelidade().catch(() => null),
        store.minhaAssinatura().catch(() => null), // banco sem a função nova: segue sem assinatura
      ]);
      setMeus(lista);
      setFidelidade(selos);
      setAssinatura(plano);
    } catch {
      setMeus((m) => m ?? []);
    }
  }, []);

  useEffect(() => {
    // Preços e serviços vêm do servidor; se ele falhar, segue com a lista local.
    store.carregarCatalogo().finally(() => setPronto(true));
    recarregarMeus();
    const onHash = () => {
      setRota(lerRota());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [recarregarMeus]);

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
      servicos: alternarServico(r.servicos, id).servicos, // um corte por vez; extras somam
      hora: null, // a duração mudou; o horário escolhido pode não caber mais
    }));

  async function confirmar(dadosCliente) {
    const ag = await store.criarAgendamento({
      barbeiroId: rascunho.barbeiroId,
      data: rascunho.data,
      hora: rascunho.hora,
      servicos: rascunho.servicos,
      cliente: dadosCliente,
    });
    setCliente(store.obterCliente());
    setUltimo(ag);
    setRascunho(RASCUNHO_VAZIO);
    navegar("/agendar/pronto", { substituir: true });
    recarregarMeus();
  }

  const proximo = (meus ?? [])
    .filter((a) => a.status === "confirmado" && ehFuturo(a))
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))[0];

  if (!pronto) return <div className="loading" aria-busy="true">Carregando…</div>;

  switch (rota) {
    case "/agendar/servicos":
      return rascunho.barbeiroId ? (
        <Servicos rascunho={rascunho} onToggle={toggleServico} onContinuar={() => navegar("/agendar/horario")} onVoltar={() => navegar("/")} />
      ) : null;
    case "/agendar/horario":
      return rascunho.barbeiroId ? (
        <Horario
          rascunho={rascunho}
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
          onConfirmar={confirmar}
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
          meus={meus}
          fidelidade={fidelidade}
          assinatura={assinatura}
          navegar={navegar}
          onCancelar={async (id) => { await store.cancelarMeu(id); await recarregarMeus(); }}
          onSalvarCliente={async (c) => setCliente(await store.salvarCliente(c))}
          onSair={async () => { await store.esquecerCliente(); setCliente(null); setMeus([]); setFidelidade(null); setAssinatura(null); }}
        />
      );
    case "/equipe":
      return <Equipe navegar={navegar} />;
    default:
      return (
        <Home
          cliente={cliente}
          proximo={proximo}
          fidelidade={fidelidade}
          assinatura={assinatura}
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
