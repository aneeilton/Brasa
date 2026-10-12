import logo from "../assets/logo.svg";
import { BARBEARIA, BARBEIROS, FUNCIONAMENTO, barbeiroPorId } from "../config.js";
import { ChevronRight, Clock, Pin, Calendar } from "../components/Icons.jsx";
import { TopBar } from "../components/UI.jsx";
import { capitalizar, dataLonga, primeiroNome } from "../lib/format.js";

const DIAS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const faixaDias = () => {
  const d = FUNCIONAMENTO.diasDaSemana;
  return `${capitalizar(DIAS[d[0]])} a ${DIAS[d[d.length - 1]]}`;
};

export default function Home({ cliente, proximo, onEscolher, navegar }) {
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
            <button key={b.id} className="barber" onClick={() => onEscolher(b.id)} aria-label={`Agendar com ${b.nome}. ${b.destaque}`}>
              <img className="barber-photo" src={b.foto} alt="" loading="eager" width="400" height="500" />
              <div className="barber-body">
                <div className="barber-name">{b.nome}</div>
                <div className="barber-tag">{b.destaque}</div>
                <div className="barber-cta">Agendar <ChevronRight size={14} /></div>
              </div>
            </button>
          ))}
        </div>

        <h2 className="section-header">Funcionamento</h2>
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
            <a className="row" style={{ textDecoration: "none" }} href={`https://maps.apple.com/?q=${encodeURIComponent(BARBEARIA.endereco)}`} target="_blank" rel="noreferrer">
              <span className="notice-icon"><Pin /></span>
              <div className="row-main"><div className="row-title">{BARBEARIA.endereco}</div></div>
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
