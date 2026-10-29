import { FIDELIDADE_META } from "../config.js";
import { Check } from "./Icons.jsx";

/* Cartão de selos: um selo por atendimento concluído, até a meta. */
export function CartaoFidelidade({ concluidos }) {
  const n = Math.min(concluidos ?? 0, FIDELIDADE_META);
  const completo = n >= FIDELIDADE_META;
  const faltam = FIDELIDADE_META - n;
  return (
    <section className="fid" aria-labelledby="fid-t">
      <div className="fid-head">
        <div>
          <h2 className="fid-titulo" id="fid-t">Cartão fidelidade</h2>
          <p className="fid-sub">
            {completo
              ? "Cartão completo! Seu bônus vem aí."
              : n === 0
                ? "Cada atendimento concluído vale um selo."
                : `Faltam ${faltam} ${faltam === 1 ? "atendimento" : "atendimentos"} para completar.`}
          </p>
        </div>
        <div className="fid-n tabular" aria-label={`${n} de ${FIDELIDADE_META} atendimentos`}>
          {n}<span>/{FIDELIDADE_META}</span>
        </div>
      </div>
      <ol className="fid-selos" aria-hidden="true">
        {Array.from({ length: FIDELIDADE_META }, (_, i) => (
          <li key={i} className="fid-selo" data-on={i < n}>
            {i < n ? <Check size={14} /> : i + 1}
          </li>
        ))}
      </ol>
      <p className="fid-nota">Bonificação em breve. Conta só atendimento concluído na barbearia.</p>
    </section>
  );
}

/* Versão compacta para listas (ex.: "3/12"). */
export function SeloFidelidade({ concluidos }) {
  if (concluidos == null) return null;
  const n = Math.min(concluidos, FIDELIDADE_META);
  return (
    <span className={`badge fid-badge${n >= FIDELIDADE_META ? " fid-badge-ok" : ""}`} title="Cartão fidelidade">
      {n}/{FIDELIDADE_META}
    </span>
  );
}
