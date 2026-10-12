import { barbeiroPorId } from "../config.js";

export default function Chosen({ barbeiroId, onTrocar }) {
  const b = barbeiroPorId(barbeiroId);
  if (!b) return null;
  return (
    <div className="chosen">
      <img className="avatar" src={b.foto} alt="" width="44" height="44" />
      <div style={{ flex: 1 }}>
        <div className="footnote">Barbeiro</div>
        <div style={{ fontWeight: 600 }}>{b.nome}</div>
      </div>
      {onTrocar && <button className="btn btn-sm btn-secondary" onClick={onTrocar}>Trocar</button>}
    </div>
  );
}
