import { useMemo, useState } from "react";
import { BARBEIROS, PIN_EQUIPE, barbeiroPorId } from "../config.js";
import { Chat } from "../components/Icons.jsx";
import { Confirm, ScreenTitle, TopBar } from "../components/UI.jsx";
import DateStrip from "../components/DateStrip.jsx";
import { diasDisponiveis } from "../lib/agenda.js";
import { capitalizar, dataLonga, deMin, mascaraTelefone, moeda, paraMin } from "../lib/format.js";
import { linkLembrete } from "../lib/whatsapp.js";

const K_SESSAO = "stark.equipe";

function Pin({ onOk }) {
  const [pin, setPin] = useState("");
  const [erro, setErro] = useState(false);
  const enviar = (e) => {
    e.preventDefault();
    if (pin === PIN_EQUIPE) {
      sessionStorage.setItem(K_SESSAO, "1");
      onOk();
    } else {
      setErro(true);
      setPin("");
    }
  };
  return (
    <form onSubmit={enviar} style={{ maxWidth: 320, margin: "32px auto 0" }}>
      <div className="group">
        <label className="field" htmlFor="pin" data-invalid={erro}>
          <span className="field-label">PIN da equipe</span>
          <input id="pin" type="password" inputMode="numeric" autoComplete="off" value={pin} onChange={(e) => { setPin(e.target.value); setErro(false); }} aria-invalid={erro} aria-describedby={erro ? "pin-erro" : undefined} autoFocus />
          {erro && <div className="field-error" id="pin-erro">PIN incorreto.</div>}
        </label>
      </div>
      <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} disabled={!pin}>Entrar</button>
    </form>
  );
}

export default function Equipe({ agendamentos, onStatus, navegar }) {
  const [liberado, setLiberado] = useState(() => sessionStorage.getItem(K_SESSAO) === "1");
  const dias = useMemo(() => diasDisponiveis(), []);
  const [dia, setDia] = useState(dias[0]);
  const [filtro, setFiltro] = useState("todos");
  const [cancelando, setCancelando] = useState(null);

  const doDia = agendamentos
    .filter((a) => a.data === dia && (filtro === "todos" || a.barbeiroId === filtro))
    .sort((a, b) => a.hora.localeCompare(b.hora));
  const ativos = doDia.filter((a) => a.status !== "cancelado");
  const previsto = ativos.reduce((s, a) => s + a.total, 0);

  return (
    <>
      <TopBar onBack={() => navegar("/")} backLabel="Início" title="Agenda" />
      <main className="page screen">
        <ScreenTitle>Agenda da equipe</ScreenTitle>
        {!liberado ? (
          <Pin onOk={() => setLiberado(true)} />
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

            {doDia.length === 0 ? (
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
                        {a.status === "concluido" && <span className="badge badge-ok">Concluído</span>}
                        {a.status === "cancelado" && <span className="badge badge-no">Cancelado</span>}
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
                          <button className="btn btn-sm btn-secondary" onClick={() => onStatus(a.id, "concluido")}>Concluir</button>
                          <button className="btn btn-sm btn-danger" onClick={() => setCancelando(a)}>Cancelar</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="footnote section-footer">
              “Lembrete” abre o WhatsApp com a mensagem pronta para o cliente.
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
        onConfirm={async () => { await onStatus(cancelando.id, "cancelado"); setCancelando(null); }}
      />
    </>
  );
}
