import { useState } from "react";
import { ActionBar, Progress, ScreenTitle, TopBar } from "../components/UI.jsx";
import ClientForm, { normalizarCliente, useClientForm } from "../components/ClientForm.jsx";
import Resumo from "./Resumo.jsx";
import { mascaraTelefone } from "../lib/format.js";

export default function Confirmar({ rascunho, cliente, onConfirmar, onVoltar, onTrocarHorario }) {
  const [editando, setEditando] = useState(!cliente);
  const form = useClientForm(cliente);
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function confirmar() {
    if (editando) {
      form.setEnviado(true);
      if (!form.valido) {
        document.querySelector('[aria-invalid="true"]')?.focus();
        return;
      }
    }
    setErro(null);
    setEnviando(true);
    try {
      await onConfirmar(editando ? normalizarCliente(form.valores) : cliente);
    } catch (e) {
      setErro(e);
      setEnviando(false);
    }
  }

  return (
    <>
      <TopBar onBack={onVoltar} backLabel="Horário" title="Confirmar" />
      <main className="page screen">
        <Progress step={3} total={3} />
        <ScreenTitle>Confira e confirme</ScreenTitle>

        <h2 className="section-header">Agendamento</h2>
        <Resumo {...rascunho} />
        <p className="footnote section-footer">Pagamento na barbearia, após o atendimento.</p>

        <h2 className="section-header">Seus dados</h2>
        {editando ? (
          <>
            <ClientForm form={form} />
            <p className="footnote section-footer">
              {cliente ? "Atualizamos seus dados neste aparelho." : "Você só preenche isso uma vez. Nas próximas, é só escolher o horário."}
              {" "}Usamos o WhatsApp para lembrar você do horário.
            </p>
          </>
        ) : (
          <div className="group">
            <div className="row">
              <div className="row-main">
                <div className="row-title">{cliente.nome}</div>
                <div className="row-sub tabular">{mascaraTelefone(cliente.whatsapp)} · {cliente.email}</div>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={() => setEditando(true)}>Editar</button>
            </div>
          </div>
        )}

        {erro && (
          <div className="alert" role="alert">
            {erro.message}
            {erro.code === "OCUPADO" && (
              <div style={{ marginTop: 8 }}>
                <button className="btn btn-sm btn-secondary" onClick={onTrocarHorario}>Escolher outro horário</button>
              </div>
            )}
          </div>
        )}
      </main>
      <ActionBar>
        <button className="btn btn-primary btn-block" onClick={confirmar} disabled={enviando} aria-busy={enviando}>
          {enviando ? "Confirmando…" : "Confirmar agendamento"}
        </button>
      </ActionBar>
    </>
  );
}
