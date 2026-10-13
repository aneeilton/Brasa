import { useCallback, useEffect, useMemo, useState } from "react";
import { servicoPorId } from "../lib/catalogo.js";
import { diasDisponiveis, horariosDoDia, temHorarioLivre } from "../lib/agenda.js";
import * as store from "../lib/store.js";
import { ActionBar, Progress, ScreenTitle, TopBar } from "../components/UI.jsx";
import DateStrip from "../components/DateStrip.jsx";
import Chosen from "./Chosen.jsx";
import { capitalizar, dataCurta, dataLonga, deMin, duracao, paraMin } from "../lib/format.js";

export default function Horario({ rascunho, onChange, onContinuar, onVoltar }) {
  const duracaoMin = rascunho.servicos.reduce((s, id) => s + (servicoPorId(id)?.duracao ?? 0), 0);
  const dias = useMemo(() => diasDisponiveis(), []);
  const [ocupados, setOcupados] = useState(null); // null = carregando
  const [falha, setFalha] = useState(null);

  const carregar = useCallback(async () => {
    setFalha(null);
    try {
      setOcupados(await store.ocupados(dias[0], dias[dias.length - 1]));
    } catch (e) {
      setFalha(e.message);
    }
  }, [dias]);

  useEffect(() => {
    carregar();
    // Outro cliente pode reservar enquanto esta tela está aberta: atualiza ao voltar para o app.
    const aoVoltar = () => document.visibilityState === "visible" && carregar();
    document.addEventListener("visibilitychange", aoVoltar);
    return () => document.removeEventListener("visibilitychange", aoVoltar);
  }, [carregar]);

  const args = (data) => ({ data, barbeiroId: rascunho.barbeiroId, duracaoMin, agendamentos: ocupados ?? [] });
  const cheio = (data) => ocupados !== null && !temHorarioLivre(args(data));

  // Quando a disponibilidade chega, o primeiro dia com vaga já vem selecionado.
  useEffect(() => {
    if (ocupados === null) return;
    if (!rascunho.data || !dias.includes(rascunho.data)) {
      onChange({ data: dias.find((d) => !cheio(d)) ?? dias[0], hora: null });
    } else if (rascunho.hora) {
      // O horário escolhido pode ter sido tomado desde a última vez.
      const livre = horariosDoDia(args(rascunho.data)).some((p) => p.horarios.some((h) => h.hora === rascunho.hora && h.livre));
      if (!livre) onChange({ hora: null });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocupados]);

  const periodos = rascunho.data && ocupados ? horariosDoDia(args(rascunho.data)) : [];
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

        {falha ? (
          <div className="alert" role="alert">
            {falha}
            <div style={{ marginTop: 8 }}>
              <button className="btn btn-sm btn-secondary" onClick={carregar}>Tentar de novo</button>
            </div>
          </div>
        ) : ocupados === null ? (
          <div className="slots" aria-busy="true" aria-label="Carregando horários" style={{ marginTop: 52 }}>
            {Array.from({ length: 12 }, (_, i) => <div key={i} className="slot skeleton" />)}
          </div>
        ) : (
          rascunho.data && (
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
          )
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
