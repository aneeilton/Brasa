import { obterCategorias, servicoPorId } from "../lib/catalogo.js";
import { Check } from "../components/Icons.jsx";
import { ActionBar, Progress, ScreenTitle, TopBar } from "../components/UI.jsx";
import { duracao, moeda } from "../lib/format.js";
import Chosen from "./Chosen.jsx";

export default function Servicos({ rascunho, onToggle, onContinuar, onVoltar }) {
  const selecionados = rascunho.servicos.map(servicoPorId).filter(Boolean);
  const total = selecionados.reduce((s, x) => s + x.preco, 0);
  const tempo = selecionados.reduce((s, x) => s + x.duracao, 0);

  return (
    <>
      <TopBar onBack={onVoltar} backLabel="Barbeiros" title="Serviços" />
      <main className="page screen">
        <Progress step={1} total={3} />
        <Chosen barbeiroId={rascunho.barbeiroId} onTrocar={onVoltar} />
        <ScreenTitle sub="Pode escolher mais de um — somamos o tempo e o valor.">O que vamos fazer?</ScreenTitle>

        {obterCategorias().map((cat) => (
          <section key={cat.id} aria-labelledby={`cat-${cat.id}`}>
            <h2 className="section-header" id={`cat-${cat.id}`}>{cat.nome}</h2>
            <div className="group">
              {cat.servicos.map((s) => {
                const on = rascunho.servicos.includes(s.id);
                return (
                  <button key={s.id} className="row" aria-pressed={on} onClick={() => onToggle(s.id)}>
                    <span className="check"><Check /></span>
                    <span className="row-main">
                      <span className="row-title" style={{ display: "block" }}>{s.nome}</span>
                      {s.descricao && <span className="row-desc">{s.descricao}</span>}
                      <span className="row-sub">{duracao(s.duracao)}</span>
                    </span>
                    <span className="row-end row-price">
                      {moeda(s.preco)}
                    </span>
                  </button>
                );
              })}
            </div>
            {cat.nota && <p className="footnote section-footer">{cat.nota}</p>}
          </section>
        ))}
      </main>
      <ActionBar
        summary={selecionados.length ? moeda(total) : "Nenhum serviço"}
        detail={selecionados.length ? `${selecionados.length} ${selecionados.length > 1 ? "serviços" : "serviço"} · ${duracao(tempo)}` : "Toque para selecionar"}
      >
        <button className="btn btn-primary" disabled={!selecionados.length} onClick={onContinuar}>Continuar</button>
      </ActionBar>
    </>
  );
}
