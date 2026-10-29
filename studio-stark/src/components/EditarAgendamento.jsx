import { useEffect, useRef, useState } from "react";
import { BARBEIROS } from "../config.js";
import { alternarServico, obterCategorias, servicoPorId } from "../lib/catalogo.js";
import { deMin, duracao, moeda, paraMin } from "../lib/format.js";
import * as store from "../lib/store.js";

const SITUACOES = [
  ["confirmado", "Agendado"],
  ["concluido", "Concluído"],
  ["faltou", "Faltou"],
  ["cancelado", "Cancelado"],
];

/* Janela do gestor para corrigir um agendamento: barbeiro, dia, horário, serviços e situação.
   O servidor recalcula duração e valor e recusa conflito de horário. */
export default function EditarAgendamento({ ag, onFechar, onSalvo }) {
  const ref = useRef(null);
  const [f, setF] = useState(null);
  const [erro, setErro] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (ag) {
      setF({ barbeiroId: ag.barbeiroId, data: ag.data, hora: ag.hora, servicos: [...ag.servicos], status: ag.status });
      setErro(null);
      if (!d.open) d.showModal();
    } else {
      setF(null);
      if (d.open) d.close();
    }
  }, [ag]);

  const itens = (f?.servicos ?? []).map(servicoPorId).filter(Boolean);
  const tempo = itens.reduce((s, x) => s + x.duracao, 0);
  const total = itens.reduce((s, x) => s + x.preco, 0);
  const pronto = f && f.data && /^\d{2}:\d{2}$/.test(f.hora) && itens.length > 0;

  async function salvar(e) {
    e.preventDefault();
    if (!pronto) return;
    setErro(null);
    setSalvando(true);
    try {
      await store.editarAgendamento({ id: ag.id, ...f });
      onSalvo();
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <dialog ref={ref} className="dialog-form" onCancel={(e) => { e.preventDefault(); onFechar(); }} aria-labelledby="editar-t">
      {ag && f && (
        <form onSubmit={salvar}>
          <div className="dialog-head">
            <h2 id="editar-t">Editar agendamento</h2>
            <p>{ag.cliente.nome}</p>
          </div>

          <div className="ed-label">Barbeiro</div>
          <div className="segmented" role="group" aria-label="Barbeiro" style={{ margin: "0 0 14px" }}>
            {BARBEIROS.map((b) => (
              <button type="button" key={b.id} aria-pressed={f.barbeiroId === b.id} onClick={() => setF({ ...f, barbeiroId: b.id })}>{b.nome}</button>
            ))}
          </div>

          <div className="ed-linha">
            <label className="ed-campo">
              <span className="ed-label">Dia</span>
              <input type="date" value={f.data} onChange={(e) => setF({ ...f, data: e.target.value })} required />
            </label>
            <label className="ed-campo">
              <span className="ed-label">Horário</span>
              <input type="time" step="300" value={f.hora} onChange={(e) => setF({ ...f, hora: e.target.value })} required />
            </label>
          </div>

          <label className="ed-campo">
            <span className="ed-label">Situação</span>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>
              {SITUACOES.map(([v, r]) => <option key={v} value={v}>{r}</option>)}
            </select>
          </label>

          <div className="ed-label" style={{ marginTop: 14 }}>Serviços <span className="ed-dica">um corte por agendamento</span></div>
          <div className="ed-servicos">
            {obterCategorias().map((c) => (
              <fieldset key={c.id}>
                <legend>{c.nome}</legend>
                <div className="ed-chips">
                  {c.servicos.map((s) => (
                    <button
                      type="button"
                      key={s.id}
                      className="ed-chip"
                      aria-pressed={f.servicos.includes(s.id)}
                      onClick={() => setF({ ...f, servicos: alternarServico(f.servicos, s.id).servicos })}
                    >
                      {s.nome}
                    </button>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>

          <div className="ed-resumo tabular" aria-live="polite">
            {itens.length
              ? <>{f.hora} – {/^\d{2}:\d{2}$/.test(f.hora) ? deMin(paraMin(f.hora) + tempo) : "—"} · {duracao(tempo)} · <strong>{moeda(total)}</strong></>
              : "Escolha ao menos um serviço."}
          </div>

          {erro && <div className="alert" role="alert" style={{ marginTop: 12 }}>{erro}</div>}

          <div className="stack" style={{ marginTop: 16 }}>
            <button className="btn btn-primary btn-block" disabled={!pronto || salvando}>{salvando ? "Salvando…" : "Salvar alterações"}</button>
            <button type="button" className="btn btn-secondary btn-block" onClick={onFechar}>Cancelar</button>
          </div>
        </form>
      )}
    </dialog>
  );
}
