import logo from "../assets/logo.svg";
import { BARBEARIA, BARBEIROS, FIDELIDADE_META, FUNCIONAMENTO, barbeiroPorId } from "../config.js";
import { ChevronRight, Clock, Pin, Calendar, Chat } from "../components/Icons.jsx";
import { linkBarbearia } from "../lib/whatsapp.js";
import { TopBar } from "../components/UI.jsx";
import { capitalizar, dataLonga, mascaraTelefone, primeiroNome } from "../lib/format.js";

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const faixaDias = () => {
  const d = FUNCIONAMENTO.diasDaSemana;
  return `${capitalizar(DIAS[d[0]])} a ${DIAS[d[d.length - 1]]}`;
};

export default function Home({ cliente, proximo, fidelidade, onEscolher, navegar }) {
  return (
    <>
      <TopBar
        end={cliente && <button className="link-btn" onClick={() => navegar("/meus")}>Meus horários</button>}
      />
      <main className="page screen">
        <div className="hero">
          <img className="logo" src={logo} alt={`${BARBEARIA.nome} ${BARBEARIA.subtitulo}`} width="260" height="68" />
        </div>

        <div className="greeting">
          <h1 className="large-title">{cliente ? `Olá, ${primeiroNome(cliente.nome)}.` : "Agende seu horário"}</h1>
          <p className="subhead">Escolha com quem você quer cortar.</p>
        </div>

        {cliente && fidelidade != null && (
          <button className="fid-atalho" onClick={() => navegar("/meus")} aria-label={`Cartão fidelidade: ${Math.min(fidelidade, FIDELIDADE_META)} de ${FIDELIDADE_META} atendimentos`}>
            <span className="fid-mini" aria-hidden="true">
              {Array.from({ length: FIDELIDADE_META }, (_, i) => <i key={i} data-on={i < fidelidade} />)}
            </span>
            <span className="fid-atalho-txt">Cartão fidelidade <strong className="tabular">{Math.min(fidelidade, FIDELIDADE_META)}/{FIDELIDADE_META}</strong></span>
            <ChevronRight />
          </button>
        )}

        {proximo && (
          <button className="notice" style={{ width: "100%", border: 0, textAlign: "left" }} onClick={() => navegar("/meus")}>
            <span className="notice-icon"><Calendar /></span>
            <span style={{ flex: 1 }}>
              <span className="footnote" style={{ display: "block" }}>Seu próximo horário</span>
              <strong>{capitalizar(dataLonga(proximo.data))}, {proximo.hora}</strong>
              <span className="footnote" style={{ display: "block" }}>com {barbeiroPorId(proximo.barbeiroId)?.nome}</span>
            </span>
            <span className="notice-icon" style={{ alignSelf: "center" }}><ChevronRight /></span>
          </button>
        )}

        <div className="barbers">
          {BARBEIROS.map((b) => (
            <button key={b.id} className="barber" onClick={() => onEscolher(b.id)} aria-label={`Agendar com ${b.nome}`}>
              <img className="barber-photo" src={b.foto} alt="" loading="eager" width="160" height="160" />
              <span className="barber-name">{b.nome}</span>
              <span className="barber-tag">Barbeiro</span>
              <span className="barber-cta" aria-hidden="true">Agendar <ChevronRight size={14} /></span>
            </button>
          ))}
        </div>

        <h2 className="section-header">Funcionamento e contato</h2>
        <div className="group">
          <div className="row">
            <span className="notice-icon"><Clock /></span>
            <div className="row-main">
              <div className="row-title">{faixaDias()}</div>
              <div className="row-sub tabular">
                {FUNCIONAMENTO.periodos.map((p) => `${p.inicio}–${p.fim}`).join("  ·  ")}
              </div>
            </div>
          </div>
          {BARBEARIA.endereco && (
            <a className="row" style={{ textDecoration: "none" }} href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BARBEARIA.endereco.replace(" — ", ", "))}`} target="_blank" rel="noreferrer">
              <span className="notice-icon"><Pin /></span>
              <div className="row-main"><div className="row-title">{BARBEARIA.endereco}</div></div>
              <ChevronRight />
            </a>
          )}
          {linkBarbearia() && (
            <a className="row" style={{ textDecoration: "none" }} href={linkBarbearia("Olá! Vim pelo app de agendamento.")} target="_blank" rel="noreferrer">
              <span className="notice-icon"><Chat size={20} /></span>
              <div className="row-main">
                <div className="row-title">WhatsApp</div>
                <div className="row-sub tabular">{mascaraTelefone(BARBEARIA.whatsapp.slice(2))}</div>
              </div>
              <ChevronRight />
            </a>
          )}
        </div>
        <p className="footnote section-footer">Pagamento feito na barbearia, após o atendimento.</p>

        <div style={{ textAlign: "center", marginTop: 40 }}>
          <button className="link-btn muted" onClick={() => navegar("/equipe")}>Área da equipe</button>
        </div>
      </main>
    </>
  );
}
