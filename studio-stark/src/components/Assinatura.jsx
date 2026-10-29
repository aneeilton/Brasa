import { deIsoData } from "../lib/format.js";

const diaMes = (iso) => deIsoData(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

/* Barra de usos do ciclo: um segmento por atendimento incluído. */
export function UsosAssinatura({ usos, limite, claro = false }) {
  const n = Math.min(usos, limite);
  return (
    <div className={`ass-barra${claro ? " ass-barra-claro" : ""}`} role="meter" aria-valuemin={0} aria-valuemax={limite} aria-valuenow={n}
      aria-label={`${n} de ${limite} atendimentos usados neste ciclo`}>
      {Array.from({ length: limite }, (_, i) => <span key={i} data-on={i < n} />)}
    </div>
  );
}

/* Cartão do cliente em "Meus horários". */
export function CartaoAssinatura({ a }) {
  const n = Math.min(a.usos, a.limite);
  const esgotou = a.usos >= a.limite;
  const restam = a.limite - n;
  return (
    <section className="ass" aria-labelledby="ass-t">
      <div className="ass-head">
        <div>
          <div className="ass-tag">Assinatura ativa</div>
          <h2 className="ass-titulo" id="ass-t">{a.plano}</h2>
        </div>
        <div className="ass-n tabular" aria-hidden="true">{n}<span>/{a.limite}</span></div>
      </div>
      <UsosAssinatura usos={a.usos} limite={a.limite} />
      <p className="ass-sub">
        {esgotou
          ? "Você usou todos os atendimentos deste ciclo. Os próximos são cobrados à parte até a renovação."
          : `${restam} ${restam === 1 ? "atendimento disponível" : "atendimentos disponíveis"} neste ciclo.`}
      </p>
      <p className="ass-nota">Renova automaticamente em {diaMes(a.renovaEm)} · ciclo desde {diaMes(a.cicloInicio)}</p>
    </section>
  );
}

/* Etiqueta compacta para a agenda da equipe. */
export function SeloAssinatura({ a }) {
  if (!a) return null;
  const esgotou = a.usos >= a.limite;
  return (
    <span className={`badge ass-badge${esgotou ? " ass-badge-fim" : ""}`} title={`${a.plano} · renova em ${diaMes(a.renovaEm)}`}>
      Assinante {Math.min(a.usos, a.limite)}/{a.limite}
    </span>
  );
}

export { diaMes };
