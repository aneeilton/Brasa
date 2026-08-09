import React, { useState, useMemo } from "react";
import {
  HOJE, AGOSTO_DIAS, AGOSTO_TOTAIS, DESPESAS_AGOSTO, COMPRAS_AGOSTO,
  FECHAMENTO_AGOSTO, RESUMO_MENSAL, RESUMO_MEDIA, RESUMO_EXTRA,
  CONTAS_A_PAGAR, BOLETOS_A_PAGAR,
} from "./dados.js";

/* ---------------- HELPERS ---------------- */
const fmt = (n) => {
  if (n === null || n === undefined || Number.isNaN(n)) return "—";
  const neg = n < 0;
  const s = Math.abs(n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (neg ? "-R$ " : "R$ ") + s;
};
const fmtDate = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
const diasAte = (d) => Math.round((d - HOJE) / 86400000);

const EMBER = "#e8622c";
const BG = "#161311";
const BG_CARD = "#1f1a17";
const BG_CARD2 = "#241e1a";
const LINE = "#332a24";
const BONE = "#efe6da";
const BONE_DIM = "#a89a8a";
const GREEN = "#7fb87a";
const RED = "#d9705a";

/* ---------------- UI PRIMITIVES ---------------- */
function Card({ children, style }) {
  return (
    <div style={{ background: BG_CARD, border: `1px solid ${LINE}`, borderRadius: 10, padding: "14px 16px", ...style }}>
      {children}
    </div>
  );
}

function StatCard({ label, value, accent, big }) {
  return (
    <Card style={{ flex: "1 1 140px", minWidth: 140 }}>
      <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: BONE_DIM, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: "'Roboto Mono', monospace", fontSize: big ? 24 : 20, fontWeight: 700, color: accent || BONE }}>{fmt(value)}</div>
    </Card>
  );
}

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: "'Bebas Neue', 'Oswald', sans-serif", fontSize: 22, letterSpacing: "0.03em", color: BONE }}>{children}</div>
      {sub && <div style={{ fontSize: 12.5, color: BONE_DIM, marginTop: 2, lineHeight: 1.5 }}>{sub}</div>}
    </div>
  );
}

function Th({ children, align = "right" }) {
  return <th style={{ padding: "6px 8px", fontWeight: 500, textAlign: align, fontSize: 12 }}>{children}</th>;
}
function Td({ children, align = "right", style }) {
  return <td style={{ padding: "8px", textAlign: align, fontFamily: "'Roboto Mono', monospace", ...style }}>{children}</td>;
}

/* ---------------- TABS ---------------- */

function CaixaDoDia() {
  const [expanded, setExpanded] = useState(null);

  const despesasPorDia = useMemo(() => {
    const map = {};
    DESPESAS_AGOSTO.forEach((d) => { (map[d.dia] = map[d.dia] || []).push(d); });
    return map;
  }, []);
  const comprasPorDia = useMemo(() => {
    const map = {};
    COMPRAS_AGOSTO.forEach((d) => { (map[d.dia] = map[d.dia] || []).push(d); });
    return map;
  }, []);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="Quanto entrou no mês" value={AGOSTO_TOTAIS.totalVendas} accent={EMBER} big />
        <StatCard label="Dinheiro em caixa hoje" value={FECHAMENTO_AGOSTO.saldo.dinheiro} big />
        <StatCard label="Sobrou no mês (saldo)" value={FECHAMENTO_AGOSTO.saldo.total} accent={GREEN} big />
      </div>

      <SectionTitle sub="Cada linha é um dia. Toque para ver os detalhes de despesas e compras daquele dia.">
        Vendas dia a dia — Agosto
      </SectionTitle>

      <div style={{ overflowX: "auto", marginBottom: 22 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 460 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${LINE}`, color: BONE_DIM }}>
              <Th align="left">Dia</Th>
              <Th>Dinheiro</Th>
              <Th>Pix</Th>
              <Th>Cartão</Th>
              <Th>Voucher</Th>
              <Th>Crediário</Th>
              <Th align="right"><span style={{ color: EMBER }}>Vendido no dia</span></Th>
            </tr>
          </thead>
          <tbody>
            {AGOSTO_DIAS.map((d) => {
              const cartao = d.credito + d.debito;
              return (
                <React.Fragment key={d.dia}>
                  <tr
                    onClick={() => setExpanded(expanded === d.dia ? null : d.dia)}
                    style={{ borderBottom: `1px solid ${LINE}`, cursor: "pointer", background: expanded === d.dia ? BG_CARD2 : "transparent" }}
                  >
                    <Td align="left" style={{ color: BONE }}>
                      Dia {String(d.dia).padStart(2, "0")}
                      <span style={{ color: BONE_DIM, marginLeft: 6, fontSize: 11 }}>{expanded === d.dia ? "▾" : "▸"}</span>
                    </Td>
                    <Td>{fmt(d.dinheiro)}</Td>
                    <Td>{fmt(d.pix)}</Td>
                    <Td>{fmt(cartao)}</Td>
                    <Td>{d.voucher > 0 ? fmt(d.voucher) : "—"}</Td>
                    <Td>{d.crediario > 0 ? fmt(d.crediario) : "—"}</Td>
                    <Td style={{ color: EMBER, fontWeight: 700 }}>{fmt(d.totalVendas)}</Td>
                  </tr>
                  {expanded === d.dia && (
                    <tr>
                      <td colSpan={7} style={{ background: "#141110", padding: "12px 14px 16px" }}>
                        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                          <div style={{ fontSize: 12, color: BONE_DIM }}>
                            Cartão crédito: <span style={{ color: BONE, fontFamily: "'Roboto Mono', monospace" }}>{fmt(d.credito)}</span>
                          </div>
                          <div style={{ fontSize: 12, color: BONE_DIM }}>
                            Cartão débito: <span style={{ color: BONE, fontFamily: "'Roboto Mono', monospace" }}>{fmt(d.debito)}</span>
                          </div>
                        </div>
                        {(d.recebParcDinheiro > 0 || d.recebParcPix > 0) && (
                          <div style={{ marginBottom: 14, padding: "8px 10px", background: BG_CARD2, borderRadius: 6 }}>
                            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: BONE_DIM, marginBottom: 4 }}>
                              Recebido de fiado (entra no caixa, não é venda nova)
                            </div>
                            {d.recebParcDinheiro > 0 && (
                              <div style={{ fontSize: 12.5, color: BONE }}>Em dinheiro: <span style={{ fontFamily: "'Roboto Mono', monospace" }}>{fmt(d.recebParcDinheiro)}</span></div>
                            )}
                            {d.recebParcPix > 0 && (
                              <div style={{ fontSize: 12.5, color: BONE }}>Em Pix: <span style={{ fontFamily: "'Roboto Mono', monospace" }}>{fmt(d.recebParcPix)}</span></div>
                            )}
                          </div>
                        )}
                        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                          <div style={{ flex: "1 1 220px" }}>
                            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: BONE_DIM, marginBottom: 6 }}>O que saiu do caixa</div>
                            {(despesasPorDia[d.dia] || []).length === 0 && <div style={{ color: BONE_DIM, fontSize: 12 }}>Nada lançado</div>}
                            {(despesasPorDia[d.dia] || []).map((it, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0", color: BONE }}>
                                <span>{it.desc} <span style={{ color: BONE_DIM }}>· {it.tipo}</span></span>
                                <span style={{ fontFamily: "'Roboto Mono', monospace" }}>{fmt(it.valor)}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ flex: "1 1 220px" }}>
                            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: BONE_DIM, marginBottom: 6 }}>O que foi comprado</div>
                            {(comprasPorDia[d.dia] || []).length === 0 && <div style={{ color: BONE_DIM, fontSize: 12 }}>Nada lançado</div>}
                            {(comprasPorDia[d.dia] || []).map((it, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "3px 0", color: BONE }}>
                                <span>{it.desc}{it.info ? ` (${it.info})` : ""} <span style={{ color: BONE_DIM }}>· {it.tipo}</span></span>
                                <span style={{ fontFamily: "'Roboto Mono', monospace" }}>{fmt(it.valor)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            <tr style={{ fontWeight: 700, borderTop: `2px solid ${LINE}` }}>
              <Td align="left" style={{ color: BONE }}>Total do mês</Td>
              <Td>{fmt(AGOSTO_TOTAIS.dinheiro)}</Td>
              <Td>{fmt(AGOSTO_TOTAIS.pix)}</Td>
              <Td>{fmt(AGOSTO_TOTAIS.credito + AGOSTO_TOTAIS.debito)}</Td>
              <Td>{fmt(AGOSTO_TOTAIS.voucher)}</Td>
              <Td>{fmt(AGOSTO_TOTAIS.crediario)}</Td>
              <Td style={{ color: EMBER }}>{fmt(AGOSTO_TOTAIS.totalVendas)}</Td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: 11.5, color: BONE_DIM, marginTop: 8, lineHeight: 1.6 }}>
          Dias 8 a 31 ainda sem lançamento na planilha. "Vendido no dia" já inclui Voucher e Fiado/Crediário — são vendas
          normais, só que o dinheiro entra depois. Quando o cliente paga o fiado, esse valor aparece separado no
          detalhe do dia como "Recebido de fiado": entra no caixa, mas não conta de novo como venda.
        </div>
      </div>

      <SectionTitle sub="Quanto entrou de dinheiro/cartão, quanto saiu em despesas e compras, e o que sobrou.">
        Fechamento do mês
      </SectionTitle>
      <div style={{ overflowX: "auto", marginBottom: 22 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 440 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${LINE}`, color: BONE_DIM }}>
              <Th align="left"></Th>
              <Th>Dinheiro</Th>
              <Th>Pix/Cartão</Th>
              <Th>Total</Th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Total que entrou", FECHAMENTO_AGOSTO.totalGeral.dinheiro, FECHAMENTO_AGOSTO.totalGeral.pixStone, FECHAMENTO_AGOSTO.totalGeral.total],
              ["Despesas do dia a dia", FECHAMENTO_AGOSTO.despesas.dinheiro, FECHAMENTO_AGOSTO.despesas.pixStone, FECHAMENTO_AGOSTO.despesas.total],
              ["Compras de mercadoria", FECHAMENTO_AGOSTO.compras.dinheiro, FECHAMENTO_AGOSTO.compras.pixStone, FECHAMENTO_AGOSTO.compras.total],
            ].map(([label, a, b, c]) => (
              <tr key={label} style={{ borderBottom: `1px solid ${LINE}` }}>
                <Td align="left" style={{ color: BONE, fontFamily: "inherit" }}>{label}</Td>
                <Td>{fmt(a)}</Td>
                <Td>{fmt(b)}</Td>
                <Td>{fmt(c)}</Td>
              </tr>
            ))}
            <tr style={{ fontWeight: 700 }}>
              <Td align="left" style={{ color: EMBER, fontFamily: "inherit" }}>O que sobrou</Td>
              <Td style={{ color: EMBER }}>{fmt(FECHAMENTO_AGOSTO.saldo.dinheiro)}</Td>
              <Td style={{ color: EMBER }}>{fmt(FECHAMENTO_AGOSTO.saldo.pixStone)}</Td>
              <Td style={{ color: EMBER }}>{fmt(FECHAMENTO_AGOSTO.saldo.total)}</Td>
            </tr>
          </tbody>
        </table>
      </div>

      <SectionTitle sub={`Quanto tem disponível nas contas em ${FECHAMENTO_AGOSTO.saldoOnlineContaEm}`}>Saldo nas contas</SectionTitle>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <StatCard label="Dinheiro (sistema)" value={FECHAMENTO_AGOSTO.saldoOnline.dinheiro} />
        <StatCard label="Diferença a acompanhar" value={FECHAMENTO_AGOSTO.saldoOnline.dinheiroDiff} accent={RED} />
        <StatCard label="Stone" value={FECHAMENTO_AGOSTO.saldoOnline.stone} />
        <StatCard label="Total disponível" value={FECHAMENTO_AGOSTO.saldoOnline.total} accent={EMBER} />
      </div>
    </div>
  );
}

function BoletosAPagar() {
  const totalAberto = BOLETOS_A_PAGAR.filter((b) => !b.pago).reduce((s, b) => s + b.valor, 0);
  const ordenados = [...BOLETOS_A_PAGAR].sort((a, b) => a.vencimento - b.vencimento);

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="Total ainda a pagar" value={totalAberto} accent={EMBER} big />
        <StatCard label="Compras neste boletim" value={BOLETOS_A_PAGAR.length} />
      </div>

      <SectionTitle sub="Compras feitas para pagar depois. Fique de olho nas datas de vencimento para não faltar dinheiro no caixa.">
        O que ainda vai vencer
      </SectionTitle>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ordenados.map((b, i) => {
          const dias = diasAte(b.vencimento);
          let corPrazo = BONE_DIM;
          let textoPrazo = `vence em ${dias} dias`;
          if (dias < 0) { corPrazo = RED; textoPrazo = `venceu há ${Math.abs(dias)} dias`; }
          else if (dias === 0) { corPrazo = RED; textoPrazo = "vence hoje"; }
          else if (dias <= 3) { corPrazo = "#e0a03c"; textoPrazo = `vence em ${dias} dias`; }

          return (
            <Card key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, color: BONE, fontSize: 14 }}>{b.produto}</div>
                  <div style={{ fontSize: 12, color: BONE_DIM, marginTop: 2 }}>
                    Comprado em {fmtDate(b.compra)} · vencimento {fmtDate(b.vencimento)}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Roboto Mono', monospace", fontWeight: 700, fontSize: 16, color: BONE }}>{fmt(b.valor)}</div>
                  <div style={{ fontSize: 11.5, color: corPrazo, fontWeight: 600, marginTop: 2 }}>{textoPrazo}</div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div style={{ marginTop: 18, padding: "10px 14px", background: BG_CARD2, borderRadius: 8, fontSize: 12, color: BONE_DIM, lineHeight: 1.6 }}>
        Nenhuma dessas compras está marcada como paga na planilha. Assim que forem pagas, atualize a coluna "PAGO?" na aba Boletos e me envie de novo pra atualizar aqui.
      </div>
    </div>
  );
}

function ContasAPagar() {
  const totalPlanejado = CONTAS_A_PAGAR.reduce((s, c) => s + c.planejado, 0);
  const totalRealizado = CONTAS_A_PAGAR.reduce((s, c) => s + c.realizado, 0);
  const totalFalta = totalPlanejado - totalRealizado;

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="Ainda falta pagar" value={totalFalta} accent={EMBER} big />
        <StatCard label="Já pago" value={totalRealizado} accent={GREEN} />
        <StatCard label="Previsto no mês" value={totalPlanejado} />
      </div>

      <SectionTitle sub="Cada barra mostra quanto já foi pago (cor) e quanto ainda falta (cinza) daquela conta.">
        Contas do mês — Agosto
      </SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {CONTAS_A_PAGAR.map((c) => {
          const pct = c.planejado ? Math.min(100, (c.realizado / c.planejado) * 100) : 0;
          const falta = c.planejado - c.realizado;
          const quitado = falta <= 0;
          return (
            <Card key={c.categoria}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, gap: 10 }}>
                <div style={{ fontWeight: 700, color: BONE, fontSize: 13.5, letterSpacing: "0.02em" }}>{c.categoria}</div>
                <div style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 12.5, color: quitado ? GREEN : EMBER, fontWeight: 700, whiteSpace: "nowrap" }}>
                  {quitado ? "Pago" : `Falta ${fmt(falta)}`}
                </div>
              </div>
              <div style={{ background: LINE, borderRadius: 4, height: 6, marginBottom: 6 }}>
                <div style={{ width: `${pct}%`, background: quitado ? GREEN : EMBER, height: "100%", borderRadius: 4 }} />
              </div>
              <div style={{ fontSize: 11.5, color: BONE_DIM, marginBottom: c.itens.length ? 8 : 0 }}>
                Pago: {fmt(c.realizado)} de {fmt(c.planejado)} previstos
              </div>
              {c.itens.length > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4, paddingTop: 8, borderTop: `1px solid ${LINE}` }}>
                  {c.itens.map((it, i) => (
                    <div key={i} style={{ fontSize: 12, color: BONE_DIM, lineHeight: 1.5, paddingLeft: 4 }}>{it}</div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function ResumoMensal() {
  const maxVal = Math.max(...RESUMO_MENSAL.map((m) => Math.max(m.entrada, m.compras)));
  return (
    <div>
      <SectionTitle sub="Março a julho — visão geral pra enxergar a tendência do negócio">Resumo mensal</SectionTitle>
      <div style={{ overflowX: "auto", marginBottom: 22 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 480 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${LINE}`, color: BONE_DIM }}>
              <Th align="left">Mês</Th>
              <Th>Entrou</Th>
              <Th>Saiu</Th>
              <Th>Compras</Th>
              <Th>Sobrou</Th>
            </tr>
          </thead>
          <tbody>
            {RESUMO_MENSAL.map((m) => (
              <tr key={m.mes} style={{ borderBottom: `1px solid ${LINE}` }}>
                <Td align="left" style={{ color: BONE, fontFamily: "inherit" }}>{m.mes}</Td>
                <Td>{fmt(m.entrada)}</Td>
                <Td>{fmt(m.saida)}</Td>
                <Td>{fmt(m.compras)}</Td>
                <Td style={{ color: m.saldo >= 0 ? GREEN : RED, fontWeight: 700 }}>{fmt(m.saldo)}</Td>
              </tr>
            ))}
            <tr style={{ fontWeight: 700, borderTop: `2px solid ${LINE}` }}>
              <Td align="left" style={{ color: EMBER, fontFamily: "inherit" }}>Média</Td>
              <Td>{fmt(RESUMO_MEDIA.entrada)}</Td>
              <Td>{fmt(RESUMO_MEDIA.saida)}</Td>
              <Td>{fmt(RESUMO_MEDIA.compras)}</Td>
              <Td style={{ color: EMBER }}>{fmt(RESUMO_MEDIA.saldo)}</Td>
            </tr>
          </tbody>
        </table>
      </div>

      <SectionTitle sub="Barra laranja = o que entrou. Barra cinza = o que foi gasto em compras.">Entrada x Compras</SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {RESUMO_MENSAL.map((m) => (
          <div key={m.mes}>
            <div style={{ fontSize: 12, color: BONE_DIM, marginBottom: 3 }}>{m.mes}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <div style={{ background: LINE, borderRadius: 4, height: 8 }}>
                <div style={{ width: `${(m.entrada / maxVal) * 100}%`, background: EMBER, height: "100%", borderRadius: 4 }} />
              </div>
              <div style={{ background: LINE, borderRadius: 4, height: 8 }}>
                <div style={{ width: `${(m.compras / maxVal) * 100}%`, background: BONE_DIM, height: "100%", borderRadius: 4 }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Posição atual</SectionTitle>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <StatCard label="Saldo agosto" value={RESUMO_EXTRA.saldoAgo} accent={RED} />
        <StatCard label="Estoque / adiantamentos" value={RESUMO_EXTRA.debito} accent={RED} />
        <StatCard label="Saldo online" value={RESUMO_EXTRA.saldoOnline} />
        <StatCard label="A receber" value={RESUMO_EXTRA.aReceber} />
      </div>
    </div>
  );
}

function Projecao() {
  const DIAS_NO_MES = 31;
  const diasRealizados = AGOSTO_DIAS.length;
  const mediaDiaria = AGOSTO_TOTAIS.totalVendas / diasRealizados;
  const projecaoMes = mediaDiaria * DIAS_NO_MES;

  const crescimentoVsMedia = ((projecaoMes - RESUMO_MEDIA.entrada) / RESUMO_MEDIA.entrada) * 100;
  const ultimoMes = RESUMO_MENSAL[RESUMO_MENSAL.length - 1];
  const crescimentoVsUltimoMes = ((projecaoMes - ultimoMes.entrada) / ultimoMes.entrada) * 100;

  const despesasPlanejadas = CONTAS_A_PAGAR.reduce((s, c) => s + c.planejado, 0);
  const comprasPrevistas = RESUMO_MEDIA.compras;
  const lucroPrevisto = projecaoMes - despesasPlanejadas - comprasPrevistas;
  const margemPrevista = (lucroPrevisto / projecaoMes) * 100;

  const barrasComparacao = [
    ...RESUMO_MENSAL.map((m) => ({ label: m.mes.slice(0, 3), valor: m.entrada, projetado: false })),
    { label: "Ago (proj.)", valor: projecaoMes, projetado: true },
  ];
  const maxBarra = Math.max(...barrasComparacao.map((b) => b.valor));

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="Previsão de vendas no mês" value={projecaoMes} accent={EMBER} big />
        <Card style={{ flex: "1 1 140px", minWidth: 140 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: BONE_DIM, marginBottom: 6 }}>Frente à média dos meses</div>
          <div style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 24, fontWeight: 700, color: crescimentoVsMedia >= 0 ? GREEN : RED }}>
            {crescimentoVsMedia >= 0 ? "▲" : "▼"} {Math.abs(crescimentoVsMedia).toFixed(1)}%
          </div>
        </Card>
        <StatCard label="Lucro previsto" value={lucroPrevisto} accent={lucroPrevisto >= 0 ? GREEN : RED} big />
      </div>
      <div style={{ marginTop: -10, marginBottom: 20, fontSize: 11.5, color: BONE_DIM }}>
        {crescimentoVsUltimoMes >= 0 ? "▲" : "▼"} {Math.abs(crescimentoVsUltimoMes).toFixed(1)}% frente a {ultimoMes.mes} (mês anterior)
      </div>

      <SectionTitle sub={`Baseado nos ${diasRealizados} dias já lançados em agosto: média de ${fmt(mediaDiaria)} por dia, multiplicada pelos 31 dias do mês. Quanto mais dias forem lançados, mais precisa fica a previsão.`}>
        Como chegamos nesse número
      </SectionTitle>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        <Card style={{ flex: "1 1 140px", minWidth: 140 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: BONE_DIM, marginBottom: 6 }}>Dias já lançados</div>
          <div style={{ fontFamily: "'Roboto Mono', monospace", fontSize: 20, fontWeight: 700, color: BONE }}>{diasRealizados} de {DIAS_NO_MES}</div>
        </Card>
        <StatCard label="Média vendida por dia" value={mediaDiaria} />
      </div>

      <SectionTitle sub="Barra laranja = meses já fechados. Barra tracejada = previsão de agosto com base no ritmo atual.">
        Comparativo de vendas mês a mês
      </SectionTitle>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
        {barrasComparacao.map((b) => (
          <div key={b.label}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: BONE_DIM, marginBottom: 3 }}>
              <span style={{ color: b.projetado ? EMBER : BONE_DIM, fontWeight: b.projetado ? 700 : 400 }}>{b.label}</span>
              <span style={{ fontFamily: "'Roboto Mono', monospace", color: b.projetado ? EMBER : BONE_DIM }}>{fmt(b.valor)}</span>
            </div>
            <div style={{ background: LINE, borderRadius: 4, height: 10 }}>
              <div
                style={{
                  width: `${(b.valor / maxBarra) * 100}%`,
                  background: b.projetado ? "transparent" : EMBER,
                  border: b.projetado ? `2px dashed ${EMBER}` : "none",
                  height: "100%",
                  borderRadius: 4,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <SectionTitle sub="Receita prevista, menos as despesas do mês e a mercadoria que costuma ser comprada (média dos últimos meses, já que ainda não há um valor de compras planejado cadastrado).">
        Previsão de lucro
      </SectionTitle>
      <Card style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
            <span style={{ color: BONE }}>Receita prevista</span>
            <span style={{ fontFamily: "'Roboto Mono', monospace", color: BONE, fontWeight: 700 }}>{fmt(projecaoMes)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
            <span style={{ color: BONE_DIM }}>− Despesas planejadas do mês</span>
            <span style={{ fontFamily: "'Roboto Mono', monospace", color: BONE_DIM }}>{fmt(despesasPlanejadas)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5 }}>
            <span style={{ color: BONE_DIM }}>− Compras de mercadoria previstas (média)</span>
            <span style={{ fontFamily: "'Roboto Mono', monospace", color: BONE_DIM }}>{fmt(comprasPrevistas)}</span>
          </div>
          <div style={{ borderTop: `1px solid ${LINE}`, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 15 }}>
            <span style={{ color: lucroPrevisto >= 0 ? GREEN : RED, fontWeight: 700 }}>= Lucro previsto</span>
            <span style={{ fontFamily: "'Roboto Mono', monospace", color: lucroPrevisto >= 0 ? GREEN : RED, fontWeight: 700 }}>{fmt(lucroPrevisto)}</span>
          </div>
          <div style={{ fontSize: 11.5, color: BONE_DIM, textAlign: "right" }}>Margem prevista: {margemPrevista.toFixed(1)}%</div>
        </div>
      </Card>

      <div style={{ fontSize: 11.5, color: BONE_DIM, lineHeight: 1.6, marginTop: 4 }}>
        Essa é uma estimativa com base no ritmo dos primeiros dias do mês — não é garantido. Vendas costumam variar de
        semana pra semana (fim de semana, feriados, promoções), então quanto mais o mês avançar, mais essa previsão
        se aproxima do resultado real.
      </div>
    </div>
  );
}

/* ---------------- APP ---------------- */

const TABS = [
  { id: "caixa", label: "Caixa do Dia", render: CaixaDoDia },
  { id: "boletos", label: "Boletos a Pagar", render: BoletosAPagar },
  { id: "contas", label: "Contas a Pagar", render: ContasAPagar },
  { id: "resumo", label: "Resumo Mensal", render: ResumoMensal },
  { id: "projecao", label: "Projeção", render: Projecao },
];

export default function App() {
  const [tab, setTab] = useState("caixa");
  const Active = TABS.find((t) => t.id === tab).render;

  return (
    <div style={{ minHeight: "100vh", background: BG, color: BONE, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Oswald:wght@500;700&family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; }
        table tbody tr:hover { background: ${BG_CARD2}; }
      `}</style>

      <div style={{ borderBottom: `1px solid ${LINE}`, padding: "20px 16px 0", position: "sticky", top: 0, background: BG, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
          <span style={{ color: EMBER, fontSize: 18 }}>●</span>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 30, letterSpacing: "0.04em", margin: 0, color: BONE }}>
            NOTE BRASA NOBRE
          </h1>
        </div>
        <div style={{ fontSize: 12, color: BONE_DIM, marginBottom: 16 }}>Painel financeiro · somente leitura</div>

        <div style={{ display: "flex", gap: 4, overflowX: "auto" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                background: "none",
                border: "none",
                color: tab === t.id ? BONE : BONE_DIM,
                fontFamily: "'Oswald', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
                padding: "8px 4px",
                marginRight: 20,
                cursor: "pointer",
                borderBottom: tab === t.id ? `2px solid ${EMBER}` : "2px solid transparent",
                whiteSpace: "nowrap",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px 16px 60px", maxWidth: 760, margin: "0 auto" }}>
        <Active />
      </div>
    </div>
  );
}
