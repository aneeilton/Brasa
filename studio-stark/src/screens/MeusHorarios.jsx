import { useState } from "react";
import { barbeiroPorId } from "../config.js";
import { Confirm, ScreenTitle, TopBar } from "../components/UI.jsx";
import ClientForm, { normalizarCliente, useClientForm } from "../components/ClientForm.jsx";
import { baixarConvite } from "../lib/calendario.js";
import { capitalizar, dataLonga, mascaraTelefone, moeda } from "../lib/format.js";
import { ehFuturo } from "../lib/agenda.js";
import { CartaoFidelidade } from "../components/Fidelidade.jsx";

function Cartao({ ag, onCancelar }) {
  const futuro = ag.status === "confirmado" && ehFuturo(ag);
  const b = barbeiroPorId(ag.barbeiroId);
  return (
    <div className="group" style={{ marginBottom: 12 }}>
      <div className="row" style={{ alignItems: "flex-start", paddingTop: 14 }}>
        <img className="avatar" src={b?.foto} alt="" width="44" height="44" />
        <div className="row-main">
          <div className="row-title" style={{ fontWeight: 600 }}>
            {capitalizar(dataLonga(ag.data))}, {ag.hora}
          </div>
          <div className="row-sub">com {b?.nome} · {ag.servicosNomes.join(", ")}</div>
          <div className="row-sub tabular">{moeda(ag.total)}</div>
        </div>
        {ag.status === "cancelado" && <span className="badge badge-no">Cancelado</span>}
        {ag.status === "concluido" && <span className="badge badge-ok">Concluído</span>}
        {ag.status === "faltou" && <span className="badge badge-no">Faltou</span>}
      </div>
      {futuro && (
        <div className="row" style={{ gap: 8 }}>
          <button className="btn btn-sm btn-secondary" onClick={() => baixarConvite(ag)}>Adicionar ao calendário</button>
          <button className="btn btn-sm btn-danger" onClick={() => onCancelar(ag)}>Cancelar</button>
        </div>
      )}
    </div>
  );
}

export default function MeusHorarios({ cliente, meus, fidelidade, onCancelar, onSalvarCliente, onSair, navegar }) {
  const [cancelando, setCancelando] = useState(null);
  const [editando, setEditando] = useState(false);
  const [saindo, setSaindo] = useState(false);
  const [falha, setFalha] = useState(null);
  const form = useClientForm(cliente);

  const lista = meus ?? [];
  const ordem = (a, b) => (a.data + a.hora).localeCompare(b.data + b.hora);
  const proximos = lista.filter((a) => a.status === "confirmado" && ehFuturo(a)).sort(ordem);
  const historico = lista.filter((a) => !proximos.includes(a)).sort(ordem).reverse();

  async function salvar() {
    form.setEnviado(true);
    if (!form.valido) return;
    setFalha(null);
    try {
      await onSalvarCliente(normalizarCliente(form.valores));
      setEditando(false);
    } catch (e) {
      setFalha(e.message);
    }
  }

  return (
    <>
      <TopBar onBack={() => navegar("/")} backLabel="Início" title="Meus horários" />
      <main className="page screen">
        <ScreenTitle>Meus horários</ScreenTitle>

        {!cliente ? (
          <div className="empty">
            <p>Você ainda não agendou por este aparelho.</p>
            <button className="btn btn-primary" onClick={() => navegar("/")}>Agendar horário</button>
          </div>
        ) : (
          <>
            {fidelidade != null && <CartaoFidelidade concluidos={fidelidade} />}

            <h2 className="section-header">Próximos</h2>
            {meus === null ? (
              <div className="group skeleton" style={{ height: 120 }} aria-busy="true" aria-label="Carregando" />
            ) : proximos.length ? (
              proximos.map((a) => <Cartao key={a.id} ag={a} onCancelar={setCancelando} />)
            ) : (
              <div className="group">
                <div className="row">
                  <div className="row-main row-sub">Nenhum horário marcado.</div>
                  <button className="btn btn-sm btn-primary" onClick={() => navegar("/")}>Agendar</button>
                </div>
              </div>
            )}

            {falha && !editando && <div className="alert" role="alert">{falha}</div>}

            {historico.length > 0 && (
              <>
                <h2 className="section-header">Histórico</h2>
                {historico.slice(0, 10).map((a) => <Cartao key={a.id} ag={a} />)}
              </>
            )}

            <h2 className="section-header">Seus dados</h2>
            {editando ? (
              <>
                <ClientForm form={form} idPrefix="perfil" />
                {falha && <div className="alert" role="alert">{falha}</div>}
                <div className="stack" style={{ marginTop: 12 }}>
                  <button className="btn btn-primary btn-block" onClick={salvar}>Salvar</button>
                  <button className="btn btn-secondary btn-block" onClick={() => setEditando(false)}>Cancelar</button>
                </div>
              </>
            ) : (
              <div className="group">
                <div className="row"><div className="row-main"><div className="row-sub">Nome</div>{cliente.nome}</div></div>
                <div className="row"><div className="row-main"><div className="row-sub">WhatsApp</div><span className="tabular">{mascaraTelefone(cliente.whatsapp)}</span></div></div>
                <div className="row"><div className="row-main"><div className="row-sub">E-mail</div>{cliente.email}</div></div>
                <button className="row" onClick={() => setEditando(true)}>Editar dados</button>
                <button className="row" style={{ color: "var(--danger)" }} onClick={() => setSaindo(true)}>Sair deste aparelho</button>
              </div>
            )}
          </>
        )}
      </main>

      <Confirm
        open={!!cancelando}
        destructive
        title="Cancelar este horário?"
        message={cancelando ? `${capitalizar(dataLonga(cancelando.data))}, às ${cancelando.hora}. O horário fica livre para outra pessoa.` : ""}
        confirmLabel="Cancelar horário"
        onCancel={() => setCancelando(null)}
        onConfirm={async () => {
          try {
            await onCancelar(cancelando.id);
          } catch (e) {
            setFalha(e.message);
          }
          setCancelando(null);
        }}
      />
      <Confirm
        open={saindo}
        destructive
        title="Sair deste aparelho?"
        message="Seus horários continuam marcados. Na próxima vez, preencha seus dados de novo."
        confirmLabel="Sair"
        onCancel={() => setSaindo(false)}
        onConfirm={async () => { await onSair(); setSaindo(false); navegar("/"); }}
      />
    </>
  );
}
