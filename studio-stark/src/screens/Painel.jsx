import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BARBEARIA } from "../config.js";
import { ChevronLeft, ChevronRight, Chat } from "../components/Icons.jsx";
import * as store from "../lib/store.js";
import { calcularPainel, HORAS_PICO, janela, periodo } from "../lib/painel.js";
import { capitalizar, deIsoData, mascaraTelefone, moeda, primeiroNome } from "../lib/format.js";

const DIAS_CURTOS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const pct = (x) => `${Math.round(x * 100)}%`;
const compacto = (n) =>
  n >= 1000 ? `R$ ${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : `R$ ${Math.round(n)}`;
/* Um teto "redondo" para o eixo: 1, 2, 2,5 ou 5 × 10ⁿ. */
const teto = (max) => {
  if (max <= 0) return 1;
  const ordem = 10 ** Math.floor(Math.log10(max));
  return [1, 2, 2.5, 5, 10].map((m) => m * ordem).find((v) => v >= max);
};

function rotuloPeriodo(p) {
  const de = deIsoData(p.de);
  const ate = deIsoData(p.ate);
  if (p.tipo === "mes") return capitalizar(de.toLocaleDateString("pt-BR", { month: "long", year: "numeric" }));
  const mesmoMes = de.getMonth() === ate.getMonth();
  const f = (d, mes) => d.toLocaleDateString("pt-BR", mes ? { day: "numeric", month: "short" } : { day: "numeric" }).replace(".", "");
  return `${f(de, !mesmoMes)} – ${f(ate, true)}`;
}

/* ---------- Tooltip único, seguindo o ponteiro ou o foco ---------- */
function useTooltip() {
  const [tip, setTip] = useState(null);
  const mostrar = (e, titulo, valor) => {
    // Ancora no topo da barra (não da coluna inteira), para o balão ficar junto do dado.
    const alvo = e.currentTarget.querySelector(".col-bar") ?? e.currentTarget;
    const r = alvo.getBoundingClientRect();
    setTip({ x: r.left + r.width / 2, y: r.top, titulo, valor });
  };
  const props = (titulo, valor) => ({
    onPointerEnter: (e) => mostrar(e, titulo, valor),
    onPointerLeave: () => setTip(null),
    onFocus: (e) => mostrar(e, titulo, valor),
    onBlur: () => setTip(null),
    tabIndex: 0,
    "aria-label": `${titulo}: ${valor}`,
  });
  // No <body>: a animação de entrada da tela mudaria a referência do position: fixed.
  const el = tip && createPortal(
    <div className="tooltip" role="presentation" style={{ left: tip.x, top: tip.y }}>
      <strong>{tip.valor}</strong>
      <span>{tip.titulo}</span>
    </div>,
    document.body
  );
  return [props, el];
}

/* ---------- Peças ---------- */
function Delta({ atual, anterior, rotulo }) {
  if (!anterior) return <div className="kpi-note">Sem dados {rotulo}</div>;
  const v = (atual - anterior) / anterior;
  const sobe = v >= 0;
  return (
    <div className={`delta ${sobe ? "delta-up" : "delta-down"}`}>
      <span aria-hidden="true">{sobe ? "▲" : "▼"}</span> {sobe ? "+" : "−"}{Math.abs(Math.round(v * 100))}%
      <span className="kpi-note"> vs. {rotulo}</span>
    </div>
  );
}

function Kpi({ rotulo, valor, children }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{rotulo}</div>
      <div className="kpi-value">{valor}</div>
      {children}
    </div>
  );
}

function Meter({ valor }) {
  return (
    <div className="meter" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(valor * 100)}>
      <span style={{ width: `${Math.min(100, valor * 100)}%` }} />
    </div>
  );
}

function Colunas({ dias, tipo, tip }) {
  const max = Math.max(0, ...dias.map((d) => d.valor));
  const top = teto(max);
  const iMax = dias.findIndex((d) => d.valor === max && max > 0);
  const temFuturo = dias.some((d) => d.futuro);
  return (
    <figure className="chart" aria-label="Movimento por dia">
      <div className="cols-area">
        <div className="grid-y" aria-hidden="true">
          {[top, top / 2, 0].map((v) => (
            <div key={v} className="grid-line"><span>{compacto(v)}</span></div>
          ))}
        </div>
        <div className="cols" data-dense={dias.length > 10}>
          {dias.map((d, i) => {
            const dt = deIsoData(d.data);
            const rotulo = dt.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" }).replace(/\./g, "");
            return (
              <div key={d.data} className="col" {...tip(capitalizar(rotulo) + (d.futuro ? " · agendado" : ""), `${moeda(d.valor)} · ${d.qtd} atend.`)}>
                <div className="col-track">
                  {i === iMax && <span className="col-cap tabular">{compacto(d.valor)}</span>}
                  <div className="col-bar" data-futuro={d.futuro} style={{ height: `${(d.valor / top) * 100}%` }} />
                </div>
                <span className="col-x" aria-hidden="true">
                  {tipo === "semana" ? DIAS_CURTOS[dt.getDay()] : dias.length > 14 && i % 2 ? "" : dt.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {temFuturo && (
        <figcaption className="legend">
          <span><i className="sw" /> Já aconteceu</span>
          <span><i className="sw sw-futuro" /> Agendado</span>
        </figcaption>
      )}
    </figure>
  );
}

function Barras({ itens, valor, rotulo, tip }) {
  const max = Math.max(1, ...itens.map(valor));
  return (
    <div className="hbars">
      {itens.map((it) => (
        <div key={it.id} className="hbar" {...tip(it.nome, rotulo(it))}>
          <div className="hbar-head">
            <span className="hbar-name">{it.nome}</span>
            <span className="hbar-val tabular">{rotulo(it)}</span>
          </div>
          <div className="hbar-track"><span style={{ width: `${(valor(it) / max) * 100}%` }} /></div>
        </div>
      ))}
    </div>
  );
}

function Calor({ pico, tip }) {
  const max = Math.max(0, ...pico.flatMap((d) => d.horas.map((h) => h.qtd)));
  const nivel = (q) => (q === 0 || max === 0 ? 0 : Math.max(1, Math.ceil((q / max) * 5)));
  return (
    <figure className="chart" aria-label="Horários de pico">
      <div className="heat" style={{ gridTemplateColumns: `36px repeat(${HORAS_PICO.length}, 1fr)` }}>
        <span />
        {HORAS_PICO.map((h) => <span key={h} className="heat-x tabular">{h}h</span>)}
        {pico.map((d) => (
          <div key={d.dow} style={{ display: "contents" }}>
            <span className="heat-y">{DIAS_CURTOS[d.dow]}</span>
            {d.horas.map((c) => (
              <span key={c.h} className="heat-cell" data-n={nivel(c.qtd)} {...tip(`${DIAS_CURTOS[d.dow]}, ${c.h}h`, `${c.qtd} ${c.qtd === 1 ? "agendamento" : "agendamentos"}`)} />
            ))}
          </div>
        ))}
      </div>
      <figcaption className="legend">
        <span className="heat-scale">
          Menos
          {[0, 1, 2, 3, 4, 5].map((n) => <i key={n} className="heat-cell heat-key" data-n={n} />)}
          Mais
        </span>
      </figcaption>
    </figure>
  );
}

function linkReativar(c) {
  const texto = `Olá, ${primeiroNome(c.nome)}! Tudo bem? Sentimos sua falta aqui no ${BARBEARIA.nome}. ` +
    `Que tal marcar seu próximo horário? É rapidinho pelo nosso app. Te esperamos!`;
  return `https://wa.me/55${c.whatsapp}?text=${encodeURIComponent(texto)}`;
}

/* ---------- Tela ---------- */
export default function Painel({ irParaAgenda }) {
  const [tipo, setTipo] = useState("semana");
  const [offset, setOffset] = useState(0);
  const p = useMemo(() => periodo(tipo, offset), [tipo, offset]);
  const [dados, setDados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [falha, setFalha] = useState(null);
  const [tip, tooltip] = useTooltip();
  const pedido = useRef(0);

  const carregar = useCallback(async () => {
    const n = ++pedido.current;
    setCarregando(true);
    setFalha(null);
    try {
      const j = janela(p);
      const lista = await store.agendamentosEntre(j.de, j.ate);
      if (n === pedido.current) setDados(calcularPainel({ lista, p }));
    } catch (e) {
      if (n === pedido.current) setFalha(e.message);
    } finally {
      if (n === pedido.current) setCarregando(false);
    }
  }, [p]);

  useEffect(() => { carregar(); }, [carregar]);

  const rotAnterior = p.parcial
    ? (tipo === "semana" ? "mesmos dias da semana anterior" : "mesmo período do mês anterior")
    : (tipo === "semana" ? "semana anterior" : "mês anterior");

  return (
    <div className="painel">
      {/* Filtros: uma linha, acima de tudo que eles afetam */}
      <div className="filtros">
        <div className="segmented" role="group" aria-label="Período" style={{ margin: 0, flex: "0 0 auto" }}>
          {[["semana", "Semana"], ["mes", "Mês"]].map(([k, r]) => (
            <button key={k} aria-pressed={tipo === k} onClick={() => { setTipo(k); setOffset(0); }} style={{ padding: "0 14px" }}>{r}</button>
          ))}
        </div>
        <div className="navegador">
          <button className="icon-btn" onClick={() => setOffset((o) => o - 1)} aria-label={`${tipo === "semana" ? "Semana" : "Mês"} anterior`}><ChevronLeft size={20} /></button>
          <span className="periodo tabular" aria-live="polite">{rotuloPeriodo(p)}</span>
          <button className="icon-btn" onClick={() => setOffset((o) => o + 1)} disabled={offset >= 1} aria-label={`Próxima ${tipo === "semana" ? "semana" : "mês"}`}><ChevronRight size={20} /></button>
        </div>
      </div>

      {falha && (
        <div className="alert" role="alert">
          {falha} <button className="btn btn-sm btn-secondary" onClick={carregar}>Tentar de novo</button>
        </div>
      )}

      {!dados ? (
        !falha && <div className="group skeleton" style={{ height: 320, marginTop: 16 }} aria-busy="true" aria-label="Carregando painel" />
      ) : (
        <div className="painel-corpo" data-recarregando={carregando} aria-busy={carregando}>
          <section className="painel-hero" aria-labelledby="hero-t">
            <div className="kpi-label" id="hero-t">Faturamento realizado</div>
            <div className="hero-value">{moeda(dados.realizado)}</div>
            <Delta atual={dados.realizado} anterior={dados.anteriorRealizado} rotulo={rotAnterior} />
            <p className="footnote" style={{ margin: "8px 0 0" }}>
              Soma dos atendimentos marcados como concluídos.
              {dados.previsto > 0 && <> Ainda há <strong>{moeda(dados.previsto)}</strong> agendados neste período.</>}
            </p>
          </section>

          {dados.semFechamento > 0 && (
            <div className="notice notice-warn" role="status">
              <span aria-hidden="true" className="warn-dot">!</span>
              <div style={{ flex: 1 }}>
                <strong>{dados.semFechamento} {dados.semFechamento === 1 ? "atendimento passou" : "atendimentos passaram"} sem fechamento.</strong>
                <div className="footnote">Marque como concluído ou falta na agenda para o faturamento ficar certo.</div>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={irParaAgenda}>Ver agenda</button>
            </div>
          )}

          <div className="kpis">
            <Kpi rotulo="Atendimentos" valor={dados.atendimentos}>
              <Delta atual={dados.atendimentos} anterior={dados.anteriorAtendimentos} rotulo={rotAnterior} />
            </Kpi>
            <Kpi rotulo="Ticket médio" valor={dados.atendimentos ? moeda(dados.ticket) : "—"}>
              <div className="kpi-note">por atendimento concluído</div>
            </Kpi>
            <Kpi rotulo="Ocupação da agenda" valor={pct(dados.ocupacao)}>
              <Meter valor={dados.ocupacao} />
            </Kpi>
            <Kpi rotulo="Faltas" valor={dados.faltas}>
              <div className="kpi-note">{dados.faltas ? `${pct(dados.taxaFaltas)} dos atendimentos` : "nenhuma no período"}{dados.cancelados ? ` · ${dados.cancelados} cancelados` : ""}</div>
            </Kpi>
          </div>

          <h2 className="section-header">Movimento por dia</h2>
          <div className="card">
            <Colunas dias={dados.porDia} tipo={tipo} tip={tip} />
          </div>

          <h2 className="section-header">Por barbeiro</h2>
          <div className="group">
            {dados.porBarbeiro.map((b) => (
              <div className="row" key={b.id} style={{ alignItems: "flex-start" }}>
                <img className="avatar" src={b.foto} alt="" width="44" height="44" />
                <div className="row-main">
                  <div className="hbar-head">
                    <span className="row-title" style={{ fontWeight: 600 }}>{b.nome}</span>
                    <span className="row-price">{moeda(b.realizado)}</span>
                  </div>
                  <div className="row-sub">
                    {b.concluidos} {b.concluidos === 1 ? "atendimento" : "atendimentos"} · {pct(b.ocupacao)} da agenda ocupada
                  </div>
                  <Meter valor={b.ocupacao} />
                </div>
              </div>
            ))}
          </div>

          <h2 className="section-header">Serviços mais pedidos</h2>
          <div className="card">
            {dados.servicos.length ? (
              <Barras itens={dados.servicos} valor={(s) => s.qtd} rotulo={(s) => `${s.qtd}× · ${moeda(s.valor)}`} tip={tip} />
            ) : (
              <p className="row-sub" style={{ margin: 0 }}>Nenhum serviço no período.</p>
            )}
          </div>

          <h2 className="section-header">Horários de pico</h2>
          <div className="card">
            <Calor pico={dados.pico} tip={tip} />
          </div>
          <p className="footnote section-footer">Horários claros são boas janelas para promoções.</p>

          <h2 className="section-header">Clientes</h2>
          <div className="kpis">
            <Kpi rotulo="Atendidos no período" valor={dados.clientes.total} />
            <Kpi rotulo="Novos" valor={dados.clientes.novos}>
              <div className="kpi-note">{dados.clientes.recorrentes} já eram clientes</div>
            </Kpi>
          </div>

          <h2 className="section-header">Chamar de volta</h2>
          {dados.reativar.length ? (
            <div className="group">
              {dados.reativar.map((c) => (
                <div className="row" key={c.whatsapp}>
                  <div className="row-main">
                    <div className="row-title">{c.nome}</div>
                    <div className="row-sub">
                      Última visita há {c.dias} dias · {c.visitas} {c.visitas === 1 ? "visita" : "visitas"} · <span className="tabular">{mascaraTelefone(c.whatsapp)}</span>
                    </div>
                  </div>
                  <a className="btn btn-sm btn-secondary" href={linkReativar(c)} target="_blank" rel="noreferrer" aria-label={`Chamar ${c.nome} no WhatsApp`}>
                    <Chat size={16} /> Chamar
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="group"><div className="row row-sub">Nenhum cliente sumido há mais de 30 dias.</div></div>
          )}
          <p className="footnote section-footer">Clientes sem visita há mais de 30 dias e sem horário marcado.</p>
        </div>
      )}
      {tooltip}
    </div>
  );
}
