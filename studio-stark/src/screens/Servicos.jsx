import { useEffect, useRef, useState } from "react";
import { fotoServico } from "../config.js";
import { alternarServico, categoriaEhDeCorte, obterCategorias, servicoPorId } from "../lib/catalogo.js";
import { Check, Clock } from "../components/Icons.jsx";
import { ActionBar, Progress, ScreenTitle, TopBar } from "../components/UI.jsx";
import { duracao, moeda } from "../lib/format.js";
import Chosen from "./Chosen.jsx";

/* Cartão de serviço: foto em destaque, nome, preço e tempo. Tocar seleciona/desmarca. */
function CartaoServico({ s, on, onToggle }) {
  const foto = fotoServico(s.id);
  return (
    <button
      className="svc"
      aria-pressed={on}
      onClick={() => onToggle(s.id)}
      aria-label={`${s.nome}, ${moeda(s.preco)}, ${duracao(s.duracao)}${s.descricao ? `. ${s.descricao}` : ""}`}
    >
      <span className="svc-foto">
        {foto ? (
          <img src={foto} alt="" loading="lazy" decoding="async" width="640" height="480" />
        ) : (
          <span className="svc-foto-vazia" aria-hidden="true">{s.nome.charAt(0)}</span>
        )}
        <span className="svc-check" aria-hidden="true"><Check size={14} /></span>
      </span>
      <span className="svc-corpo">
        <span className="svc-nome">{s.nome}</span>
        {s.descricao && <span className="svc-desc">{s.descricao}</span>}
        <span className="svc-meta">
          <span className="svc-preco">{moeda(s.preco)}</span>
          <span className="svc-tempo"><Clock size={13} /> {duracao(s.duracao)}</span>
        </span>
      </span>
    </button>
  );
}

export default function Servicos({ rascunho, onToggle, onContinuar, onVoltar }) {
  const categorias = obterCategorias();
  const selecionados = rascunho.servicos.map(servicoPorId).filter(Boolean);
  const total = selecionados.reduce((s, x) => s + x.preco, 0);
  const tempo = selecionados.reduce((s, x) => s + x.duracao, 0);

  // Barra de categorias: acompanha a rolagem e leva direto à seção tocada.
  const [ativa, setAtiva] = useState(categorias[0]?.id);
  const barraRef = useRef(null);
  const indo = useRef(false);
  useEffect(() => {
    const vistas = new Map();
    const obs = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((e) => vistas.set(e.target.id, e.isIntersecting));
        if (indo.current) return;
        const primeira = categorias.find((c) => vistas.get(`cat-${c.id}`));
        if (primeira) setAtiva(primeira.id);
      },
      { rootMargin: "-120px 0px -55% 0px" }
    );
    categorias.forEach((c) => {
      const el = document.getElementById(`cat-${c.id}`);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    barraRef.current?.querySelector(`[data-cat="${ativa}"]`)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [ativa]);

  // Escolher outro corte troca o anterior; um aviso rápido deixa isso claro.
  const [aviso, setAviso] = useState(null);
  const timerAviso = useRef(null);
  const escolher = (id) => {
    const { trocado } = alternarServico(rascunho.servicos, id);
    onToggle(id);
    if (trocado) {
      setAviso(`Trocamos ${trocado.nome} por ${servicoPorId(id)?.nome}. É um corte por agendamento.`);
      clearTimeout(timerAviso.current);
      timerAviso.current = setTimeout(() => setAviso(null), 3500);
    }
  };
  useEffect(() => () => clearTimeout(timerAviso.current), []);

  const irPara = (id) => {
    setAtiva(id);
    indo.current = true;
    const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: reduzido ? "auto" : "smooth", block: "start" });
    setTimeout(() => (indo.current = false), 700);
  };

  return (
    <>
      <TopBar onBack={onVoltar} backLabel="Barbeiros" title="Serviços" />
      <main className="page screen">
        <Progress step={1} total={3} />
        <Chosen barbeiroId={rascunho.barbeiroId} onTrocar={onVoltar} />
        <ScreenTitle sub="Escolha um corte ou combo. Barba, acabamentos e tratamentos podem ser somados.">O que vamos fazer?</ScreenTitle>

        <nav className="cat-bar" aria-label="Categorias de serviço" ref={barraRef}>
          {categorias.map((c) => {
            const n = c.servicos.filter((s) => rascunho.servicos.includes(s.id)).length;
            return (
              <button key={c.id} data-cat={c.id} className="cat-chip" aria-current={ativa === c.id ? "true" : undefined} onClick={() => irPara(c.id)}>
                {c.nome}
                {n > 0 && <span className="cat-n" aria-label={`${n} escolhido${n > 1 ? "s" : ""}`}>{n}</span>}
              </button>
            );
          })}
        </nav>

        {categorias.map((cat) => (
          <section key={cat.id} id={`cat-${cat.id}`} className="cat-sec" aria-labelledby={`cat-t-${cat.id}`}>
            <h2 className="cat-titulo" id={`cat-t-${cat.id}`}>
              {cat.nome}
              <span className="cat-regra">{categoriaEhDeCorte(cat) ? "Escolha 1 corte" : "Pode somar"}</span>
            </h2>
            <div className="svc-grid">
              {cat.servicos.map((s) => (
                <CartaoServico key={s.id} s={s} on={rascunho.servicos.includes(s.id)} onToggle={escolher} />
              ))}
            </div>
            {cat.nota && <p className="footnote section-footer">{cat.nota}</p>}
          </section>
        ))}
        <p className="footnote" style={{ textAlign: "center", marginTop: 24 }}>Fotos ilustrativas.</p>
      </main>
      <div className="toast" role="status" aria-live="polite" data-on={!!aviso}>{aviso}</div>
      <ActionBar
        summary={selecionados.length ? moeda(total) : "Nenhum serviço"}
        detail={selecionados.length ? `${selecionados.map((s) => s.nome).join(" + ")} · ${duracao(tempo)}` : "Toque nos cartões para escolher"}
      >
        <button className="btn btn-primary" disabled={!selecionados.length} onClick={onContinuar}>Continuar</button>
      </ActionBar>
    </>
  );
}
