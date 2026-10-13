import { barbeiroPorId } from "../config.js";
import { servicoPorId } from "../lib/catalogo.js";
import { capitalizar, dataLonga, deMin, duracao, moeda, paraMin } from "../lib/format.js";

/* Recibo do agendamento — usado na confirmação e na tela de sucesso. */
export default function Resumo({ barbeiroId, servicos, data, hora }) {
  const itens = servicos.map(servicoPorId);
  const tempo = itens.reduce((s, x) => s + x.duracao, 0);
  const total = itens.reduce((s, x) => s + x.preco, 0);
  return (
    <dl className="group" style={{ margin: 0 }}>
      <div className="summary-row"><dt>Barbeiro</dt><dd>{barbeiroPorId(barbeiroId)?.nome}</dd></div>
      <div className="summary-row"><dt>Dia</dt><dd>{capitalizar(dataLonga(data))}</dd></div>
      <div className="summary-row"><dt>Horário</dt><dd className="tabular">{hora} – {deMin(paraMin(hora) + tempo)}</dd></div>
      <div className="summary-row">
        <dt>{itens.length > 1 ? "Serviços" : "Serviço"}</dt>
        <dd>{itens.map((s) => <div key={s.id}>{s.nome}</div>)}</dd>
      </div>
      <div className="summary-row"><dt>Duração</dt><dd>{duracao(tempo)}</dd></div>
      <div className="summary-row summary-total"><dt>Total</dt><dd className="tabular">{moeda(total)}</dd></div>
    </dl>
  );
}
