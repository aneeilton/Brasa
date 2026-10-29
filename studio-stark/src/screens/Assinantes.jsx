import { useCallback, useEffect, useState } from "react";
import { Confirm } from "../components/UI.jsx";
import { UsosAssinatura, diaMes } from "../components/Assinatura.jsx";
import * as store from "../lib/store.js";
import { agoraNaBarbearia } from "../lib/agenda.js";
import { isoData, mascaraTelefone, moeda, soDigitos } from "../lib/format.js";

/* Aba do gestor: assinaturas ativas (uso do ciclo, renovação) e cadastro de novas. */
export default function Assinantes({ aoMudar }) {
  const [lista, setLista] = useState(null);
  const [planos, setPlanos] = useState([]);
  const [falha, setFalha] = useState(null);
  const [novo, setNovo] = useState(false);
  const [cancelando, setCancelando] = useState(null);
  const vazio = () => ({ whatsapp: "", nome: "", planoId: "", inicio: isoData(agoraNaBarbearia()) });
  const [f, setF] = useState(vazio);
  const [erroForm, setErroForm] = useState(null);
  const [salvando, setSalvando] = useState(false);

  const carregar = useCallback(async () => {
    setFalha(null);
    try {
      const [as, ps] = await Promise.all([store.assinaturasEquipe(), store.listarPlanos()]);
      setLista(as);
      setPlanos(ps);
      setF((x) => (x.planoId ? x : { ...x, planoId: ps[0]?.id ?? "" }));
    } catch (e) {
      setFalha(e.message);
    }
  }, []);
  useEffect(() => { carregar(); }, [carregar]);

  const zap = soDigitos(f.whatsapp);
  const valido = zap.length >= 10 && zap.length <= 11 && f.nome.trim().split(/\s+/).length >= 1 && f.nome.trim() && f.planoId && f.inicio;

  async function salvar(e) {
    e.preventDefault();
    if (!valido) return;
    setErroForm(null);
    setSalvando(true);
    try {
      await store.salvarAssinatura({ whatsapp: zap, nome: f.nome, planoId: f.planoId, inicio: f.inicio });
      setNovo(false);
      setF({ ...vazio(), planoId: planos[0]?.id ?? "" });
      await carregar();
      aoMudar?.();
    } catch (err) {
      setErroForm(err.message);
    } finally {
      setSalvando(false);
    }
  }

  const esgotadas = (lista ?? []).filter((a) => a.usos >= a.limite).length;

  return (
    <>
      <div className="ass-resumo">
        <div className="kpi"><div className="kpi-label">Assinantes ativos</div><div className="kpi-value">{lista?.length ?? "—"}</div></div>
        <div className="kpi">
          <div className="kpi-label">Receita mensal</div>
          <div className="kpi-value">{lista ? moeda(lista.reduce((s, a) => s + a.preco, 0)) : "—"}</div>
        </div>
      </div>

      {!novo ? (
        <button className="btn btn-primary btn-block" style={{ marginTop: 16 }} onClick={() => setNovo(true)}>Nova assinatura</button>
      ) : (
        <form className="group" style={{ marginTop: 16, padding: "4px 0 16px" }} onSubmit={salvar}>
          <label className="field">
            <span className="field-label">WhatsApp do cliente</span>
            <input inputMode="tel" placeholder="(75) 99999-9999" value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: mascaraTelefone(e.target.value) })} autoFocus />
          </label>
          <label className="field">
            <span className="field-label">Nome</span>
            <input autoCapitalize="words" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} />
          </label>
          <label className="field">
            <span className="field-label">Começa em (renova todo mês neste dia)</span>
            <input type="date" value={f.inicio} onChange={(e) => setF({ ...f, inicio: e.target.value })} />
          </label>
          <div style={{ padding: "8px 16px 0" }}>
            <div className="field-label" style={{ marginBottom: 8 }}>Plano</div>
            <div className="planos" role="radiogroup" aria-label="Plano">
              {planos.map((p) => (
                <button type="button" key={p.id} role="radio" aria-checked={f.planoId === p.id} className="plano" onClick={() => setF({ ...f, planoId: p.id })}>
                  <span className="plano-nome">{p.nome}</span>
                  <span className="plano-meta tabular">{moeda(p.preco)}/mês · {p.limite} atendimentos</span>
                </button>
              ))}
            </div>
            {erroForm && <div className="alert" role="alert">{erroForm}</div>}
            <div className="stack" style={{ marginTop: 14 }}>
              <button className="btn btn-primary btn-block" disabled={!valido || salvando}>{salvando ? "Salvando…" : "Criar assinatura"}</button>
              <button type="button" className="btn btn-secondary btn-block" onClick={() => { setNovo(false); setErroForm(null); }}>Cancelar</button>
            </div>
          </div>
        </form>
      )}

      <h2 className="section-header" style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Assinaturas ativas</span>
        {esgotadas > 0 && <span style={{ textTransform: "none" }}>{esgotadas} no limite</span>}
      </h2>
      {falha && <div className="alert" role="alert">{falha} <button className="btn btn-sm btn-secondary" onClick={carregar}>Tentar de novo</button></div>}
      {lista === null ? (
        !falha && <div className="group skeleton" style={{ height: 140 }} aria-busy="true" aria-label="Carregando assinaturas" />
      ) : lista.length === 0 ? (
        <div className="group"><div className="row row-sub">Nenhuma assinatura ativa. Toque em “Nova assinatura”.</div></div>
      ) : (
        <div className="group">
          {lista.map((a) => (
            <div className="row" key={a.id} style={{ alignItems: "flex-start" }}>
              <div className="row-main">
                <div className="hbar-head">
                  <span className="row-title" style={{ fontWeight: 600 }}>{a.nome}</span>
                  <span className="tabular" style={{ fontWeight: 700 }}>{Math.min(a.usos, a.limite)}/{a.limite}</span>
                </div>
                <div className="row-sub">{a.plano} · {moeda(a.preco)}/mês</div>
                <UsosAssinatura usos={a.usos} limite={a.limite} claro />
                <div className="row-sub tabular" style={{ marginTop: 6 }}>
                  Renova em {diaMes(a.renovaEm)} · {mascaraTelefone(a.whatsapp)}
                </div>
                <button className="btn btn-sm btn-danger" style={{ marginTop: 10 }} onClick={() => setCancelando(a)}>Cancelar renovação</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <p className="footnote section-footer">
        Conta como uso o atendimento <strong>concluído</strong> na agenda com serviço do plano. O contador zera sozinho no dia da renovação.
        Planos, valores e quantidade de atendimentos ficam na tabela <em>planos</em> do Supabase.
      </p>

      <Confirm
        open={!!cancelando}
        destructive
        title="Cancelar a renovação?"
        message={cancelando ? `${cancelando.nome} deixa de ser assinante agora (${cancelando.plano}).` : ""}
        confirmLabel="Cancelar renovação"
        onCancel={() => setCancelando(null)}
        onConfirm={async () => {
          try {
            await store.cancelarAssinatura(cancelando.id);
            await carregar();
            aoMudar?.();
          } catch (e) {
            setFalha(e.message);
          }
          setCancelando(null);
        }}
      />
    </>
  );
}
