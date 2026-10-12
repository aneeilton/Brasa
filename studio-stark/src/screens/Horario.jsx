import { useEffect, useMemo } from "react";
import { servicoPorId } from "../config.js";
import { diasDisponiveis, horariosDoDia, temHorarioLivre } from "../lib/agenda.js";
import { ActionBar, Progress, ScreenTitle, TopBar } from "../components/UI.jsx";
import DateStrip from "../components/DateStrip.jsx";
import Chosen from "./Chosen.jsx";
import { capitalizar, dataCurta, dataLonga, deMin, duracao, paraMin } from "../lib/format.js";

export default function Horario({ rascunho, agendamentos, onChange, onContinuar, onVoltar }) {
  const duracaoMin = rascunho.servicos.reduce((s, id) => s + servicoPorId(id).duracao, 0);
  const dias = useMemo(() => diasDisponiveis(), []);
  const args = (data) => ({ data, barbeiroId: rascunho.barbeiroId, duracaoMin, agendamentos });
  const cheio = (data) => !temHorarioLivre(args(data));

  // Primeiro dia com vaga já vem selecionado: menos um toque para a maioria.
  useEffect(() => {
    if (!rascunho.data || !dias.includes(rascunho.data)) {
      const primeiro = dias.find((d) => !cheio(d)) ?? dias[0];
      onChange({ data: primeiro, hora: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const periodos = rascunho.data ? horariosDoDia(args(rascunho.data)) : [];
  const algumLivre = periodos.some((p) => p.horarios.some((h) => h.livre));
  const fim = rascunho.hora ? deMin(paraMin(rascunho.hora) + duracaoMin) : null;

  return (
    <>
      <TopBar onBack={onVoltar} backLabel="Serviços" title="Horário" />
      <main className="page screen">
        <Progress step={2} total={3} />
        <Chosen barbeiroId={rascunho.barbeiroId} />
        <ScreenTitle sub={`Atendimento de aproximadamente ${duracao(duracaoMin)}.`}>Quando fica melhor?</ScreenTitle>

        <h2 className="section-header" style={{ marginLeft: 0 }}>Dia</h2>
        <DateStrip dias={dias} selecionado={rascunho.data} cheio={cheio} onSelect={(data) => onChange({ data, hora: null })} />

        {rascunho.data && (
          <section aria-labelledby="horarios-titulo">
            <h2 className="section-header" style={{ marginLeft: 0 }} id="horarios-titulo">
              {capitalizar(dataLonga(rascunho.data))}
            </h2>
            {!algumLivre ? (
              <div className="empty">
                <p style={{ margin: 0 }}>Sem horários livres neste dia.</p>
                <p className="footnote">Tente outro dia ou escolha outro barbeiro.</p>
              </div>
            ) : (
              periodos.map((p) =>
                p.horarios.length ? (
                  <div key={p.nome} role="radiogroup" aria-label={p.nome}>
                    <div className="period-title">
                      {p.nome}
                      <span>{p.horarios.filter((h) => h.livre).length} livres</span>
                    </div>
                    <div className="slots">
                      {p.horarios.map((h) => (
                        <button
                          key={h.hora}
                          className="slot"
                          role="radio"
                          aria-checked={rascunho.hora === h.hora}
                          disabled={!h.livre}
                          aria-label={h.livre ? h.hora : `${h.hora}, ocupado`}
                          onClick={() => onChange({ hora: h.hora })}
                        >
                          {h.hora}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null
              )
            )}
          </section>
        )}
      </main>
      <ActionBar
        summary={rascunho.hora ? `${capitalizar(dataCurta(rascunho.data))} · ${rascunho.hora}` : "Escolha um horário"}
        detail={rascunho.hora ? `Até ${fim} · ${duracao(duracaoMin)}` : duracao(duracaoMin)}
      >
        <button className="btn btn-primary" disabled={!rascunho.hora} onClick={onContinuar}>Continuar</button>
      </ActionBar>
    </>
  );
}
