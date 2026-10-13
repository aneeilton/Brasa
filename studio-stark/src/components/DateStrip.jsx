import { deIsoData } from "../lib/format.js";

export default function DateStrip({ dias, selecionado, onSelect, cheio = () => false, label = "Escolha o dia" }) {
  return (
    <div className="dates" role="group" aria-label={label}>
      {dias.map((iso) => {
        const d = deIsoData(iso);
        const wd = d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");
        const mes = d.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
        const lotado = cheio(iso);
        const nomeCompleto = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
        return (
          <button
            key={iso}
            className="date"
            aria-pressed={selecionado === iso}
            data-full={lotado}
            aria-label={`${nomeCompleto}${lotado ? ", sem horários livres" : ""}`}
            onClick={() => onSelect(iso)}
          >
            <span className="date-wd">{wd}</span>
            <span className="date-d">{d.getDate()}</span>
            <span className="date-m">{mes}</span>
          </button>
        );
      })}
    </div>
  );
}
