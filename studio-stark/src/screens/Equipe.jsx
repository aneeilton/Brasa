import { useCallback, useEffect, useMemo, useState } from "react";
import { BARBEIROS, PIN_EQUIPE, barbeiroPorId } from "../config.js";
import { Chat } from "../components/Icons.jsx";
import { Confirm, ScreenTitle, TopBar } from "../components/UI.jsx";
import DateStrip from "../components/DateStrip.jsx";
import { abreNoDia, agoraNaBarbearia, diasDisponiveis } from "../lib/agenda.js";
import * as store from "../lib/store.js";
import { capitalizar, dataLonga, deMin, isoData, mascaraTelefone, moeda, paraMin } from "../lib/format.js";
import { linkLembrete } from "../lib/whatsapp.js";
import Painel from "./Painel.jsx";
import { SeloFidelidade } from "../components/Fidelidade.jsx";

function Login({ onOk }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const enviar = async (e) => {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      await store.entrarEquipe({ email, senha, pin: senha, pinCorreto: PIN_EQUIPE });
      onOk();
    } catch (err) {
      setErro(err.message);
      setSenha("");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={enviar} style={{ maxWidth: 360, margin: "24px auto 0" }}>
      <div className="group">
        {store.remoto && (
          <label className="field" htmlFor="eq-email">
            <span className="field-label">E-mail</span>
            <input id="eq-email" type="email" autoComplete="username" autoCapitalize="off" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </label>
        )}
        <label className="field" htmlFor="eq-senha" data-invalid={!!erro}>
          <span className="field-label">{store.remoto ? "Senha" : "PIN da equipe"}</span>
          <input
            id="eq-senha"
            type="password"
            inputMode={store.remoto ? undefined : "numeric"}
            autoComplete={store.remoto ? "current-password" : "off"}
            value={senha}
            onChange={(e) => { setSenha(e.target.value); setErro(null); }}
            aria-invalid={!!erro}
            aria-describedby={erro ? "eq-erro" : undefined}
            autoFocus={!store.remoto}
          />
          {erro && <div className="field-error" id="eq-erro" role="alert">{erro}</div>}
        </label>
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={!senha || (store.remoto && !email) || enviando}>
        {enviando ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}

export default function Equipe({ navegar }) {
  const [liberado, setLiberado] = useState(null); // null = verificando
  const dias = useMemo(() => {
    const abertos = diasDisponiveis();
    const agora = agoraNaBarbearia();
    const hoje = isoData(agora);
    return abertos.includes(hoje) || !abreNoDia(agora) ? abertos : [hoje, ...abertos];
  }, []);
  // A equipe vê o dia de hoje mesmo depois do último horário vendável.
  const [dia, setDia] = useState(() => dias[0]);
  const [filtro, setFiltro] = useState("todos");
  const [lista, setLista] = useState(null);
  const [falha, setFalha] = useState(null);
  const [cancelando, setCancelando] = useState(null);
  const [selos, setSelos] = useState({});
  const [gestor, setGestor] = useState(false);
  const [aba, setAba] = useState(() => sessionStorage.getItem("stark.aba") || "agenda");

  useEffect(() => {
    store.sessaoEquipe().then(setLiberado);
  }, []);

  useEffect(() => {
    if (liberado) store.ehGestor().then(setGestor);
    else setGestor(false);
  }, [liberado]);

  const trocarAba = (a) => {
    setAba(a);
    sessionStorage.setItem("stark.aba", a);
  };
  const vendoPainel = gestor && aba === "painel";

  const carregar = useCallback(async () => {
    setFalha(null);
    try {
      const doDia = await store.agendaDoDia(dia);
      setLista(doDia);
      // Selos do cartão fidelidade de cada cliente do dia (não trava a agenda se falhar).
      store.fidelidadeClientes(doDia.map((a) => a.cliente?.whatsapp)).then(setSelos).catch(() => {});
    } catch (e) {
      setFalha(e.message);
    }
  }, [dia]);

  // Atualiza ao trocar de dia, a cada minuto e quando o app volta ao primeiro plano.
  useEffect(() => {
    if (!liberado || vendoPainel) return;
    setLista(null);
    carregar();
    const t = setInterval(carregar, 60_000);
    const aoVoltar = () => document.visibilityState === "visible" && carregar();
    document.addEventListener("visibilitychange", aoVoltar);
    return () => {
      clearInterval(t);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, [liberado, vendoPainel, carregar]);

  const mudarStatus = async (id, status) => {
    try {
      await store.atualizarStatus(id, status);
      await carregar();
    } catch (e) {
      setFalha(e.message);
    }
  };

  const doDia = (lista ?? [])
    .filter((a) => filtro === "todos" || a.barbeiroId === filtro)
    .sort((a, b) => a.hora.localeCompare(b.hora));
  const ativos = doDia.filter((a) => a.status !== "cancelado");
  const previsto = ativos.reduce((s, a) => s + a.total, 0);

  return (
    <>
      <TopBar
        onBack={() => navegar("/")}
        backLabel="Início"
        title="Equipe"
        end={liberado && (
          <button className="link-btn" onClick={async () => { await store.sairEquipe(); setLiberado(false); }}>Sair</button>
        )}
      />
      <main className="page screen">
        <ScreenTitle>{vendoPainel ? "Painel do negócio" : "Agenda da equipe"}</ScreenTitle>
        {liberado && gestor && (
          <div className="segmented abas" role="tablist" aria-label="Área da equipe">
            {[["agenda", "Agenda"], ["painel", "Painel"]].map(([k, r]) => (
              <button key={k} role="tab" aria-selected={aba === k} aria-pressed={aba === k} onClick={() => trocarAba(k)}>{r}</button>
            ))}
          </div>
        )}
        {liberado === null ? null : !liberado ? (
          <Login onOk={() => setLiberado(true)} />
        ) : vendoPainel ? (
          <Painel irParaAgenda={() => trocarAba("agenda")} />
        ) : (
          <>
            <div className="segmented" role="group" aria-label="Filtrar por barbeiro">
              {[{ id: "todos", nome: "Todos" }, ...BARBEIROS].map((b) => (
                <button key={b.id} aria-pressed={filtro === b.id} onClick={() => setFiltro(b.id)}>{b.nome}</button>
              ))}
            </div>
            <DateStrip dias={dias} selecionado={dia} onSelect={setDia} label="Dia da agenda" />

            <h2 className="section-header" style={{ display: "flex", justifyContent: "space-between" }}>
              <span>{capitalizar(dataLonga(dia))}</span>
              <span className="tabular" style={{ textTransform: "none" }}>{ativos.length} · {moeda(previsto)}</span>
            </h2>

            {falha && (
              <div className="alert" role="alert" style={{ marginBottom: 12 }}>
                {falha}{" "}
                <button className="btn btn-sm btn-secondary" onClick={carregar}>Tentar de novo</button>
              </div>
            )}

            {lista === null ? (
              <div className="group skeleton" style={{ height: 160 }} aria-busy="true" aria-label="Carregando agenda" />
            ) : doDia.length === 0 ? (
              <div className="group"><div className="row row-sub">Nenhum agendamento neste dia.</div></div>
            ) : (
              <div className="group">
                {doDia.map((a) => (
                  <div className="row" key={a.id} style={{ alignItems: "flex-start", flexWrap: "wrap", opacity: a.status === "cancelado" ? 0.5 : 1 }}>
                    <div className="tabular" style={{ width: 56, fontWeight: 600 }}>
                      {a.hora}
                      <div className="row-sub">{deMin(paraMin(a.hora) + a.duracao)}</div>
                    </div>
                    <div className="row-main">
                      <div className="row-title" style={{ fontWeight: 600 }}>
                        {a.cliente.nome}{" "}
                        <SeloFidelidade concluidos={selos[a.cliente.whatsapp] ?? 0} />{" "}
                        {a.status === "concluido" && <span className="badge badge-ok">Concluído</span>}
                        {a.status === "cancelado" && <span className="badge badge-no">Cancelado</span>}
                        {a.status === "faltou" && <span className="badge badge-no">Faltou</span>}
                      </div>
                      <div className="row-sub">{a.servicosNomes.join(", ")}</div>
                      <div className="row-sub tabular">
                        {filtro === "todos" && `${barbeiroPorId(a.barbeiroId)?.nome} · `}{mascaraTelefone(a.cliente.whatsapp)} · {moeda(a.total)}
                      </div>
                      {a.status === "confirmado" && (
                        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                          <a className="btn btn-sm btn-secondary" href={linkLembrete(a)} target="_blank" rel="noreferrer">
                            <Chat size={16} /> Lembrete
                          </a>
                          <button className="btn btn-sm btn-secondary" onClick={() => mudarStatus(a.id, "concluido")}>Concluir</button>
                          <button className="btn btn-sm btn-secondary" onClick={() => mudarStatus(a.id, "faltou")}>Faltou</button>
                          <button className="btn btn-sm btn-danger" onClick={() => setCancelando(a)}>Cancelar</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="footnote section-footer">
              “Lembrete” abre o WhatsApp com a mensagem pronta para o cliente. A agenda atualiza sozinha a cada minuto.
            </p>
          </>
        )}
      </main>
      <Confirm
        open={!!cancelando}
        destructive
        title="Cancelar agendamento?"
        message={cancelando ? `${cancelando.cliente.nome}, ${cancelando.hora}. Avise o cliente pelo WhatsApp.` : ""}
        confirmLabel="Cancelar agendamento"
        onCancel={() => setCancelando(null)}
        onConfirm={async () => { await mudarStatus(cancelando.id, "cancelado"); setCancelando(null); }}
      />
    </>
  );
}
