import { useEffect, useRef } from "react";
import { barbeiroPorId } from "../config.js";
import { Check } from "../components/Icons.jsx";
import { TopBar } from "../components/UI.jsx";
import { baixarConvite } from "../lib/calendario.js";
import { primeiroNome } from "../lib/format.js";
import Resumo from "./Resumo.jsx";

export default function Pronto({ agendamento, navegar }) {
  const ref = useRef(null);
  useEffect(() => ref.current?.focus({ preventScroll: true }), []);
  if (!agendamento) return null;
  const barbeiro = barbeiroPorId(agendamento.barbeiroId);
  return (
    <>
      <TopBar end={<button className="link-btn" onClick={() => navegar("/")}>OK</button>} />
      <main className="page screen">
        <div className="success">
          <div className="success-icon" aria-hidden="true"><Check size={34} /></div>
          <h1 className="large-title" tabIndex={-1} ref={ref} style={{ outline: "none" }}>
            Tudo certo, {primeiroNome(agendamento.cliente.nome)}!
          </h1>
          <p className="subhead">{barbeiro?.nome} está te esperando. Chegue uns 5 minutos antes.</p>
        </div>

        <h2 className="section-header">Seu horário</h2>
        <Resumo {...agendamento} />

        <div className="stack" style={{ marginTop: 24 }}>
          <button className="btn btn-primary btn-block" onClick={() => baixarConvite(agendamento)}>Adicionar ao calendário</button>
          <button className="btn btn-secondary btn-block" onClick={() => navegar("/meus")}>Ver meus horários</button>
        </div>
        <p className="footnote" style={{ textAlign: "center", marginTop: 16 }}>
          Precisa remarcar? Cancele em “Meus horários” e escolha um novo horário.
        </p>
      </main>
    </>
  );
}
