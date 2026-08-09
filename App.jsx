import React, { useState, useMemo } from "react";

/* ---------------- DATA SNAPSHOT (da planilha "Note Brasa Nobre") ---------------- */
/* Atualizado a partir do arquivo/link enviado. Para atualizar, envie a planilha ou o link de novo. */
/* "Hoje" usado para calcular vencimentos: */
const HOJE = new Date(2026, 7, 9); // 9 de agosto de 2026

/* "Vendido no dia" = Dinheiro + Pix + Crédito + Débito + Voucher + Crediário (bate com a linha RESUMO DIA da planilha). */
/* recebParc = pagamentos de fiado recebidos no dia — entram no caixa, mas NÃO contam como venda nova (a venda já foi contada quando foi feita a fiado). */
const AGOSTO_DIAS = [
  { dia: 1, dinheiro: 2488.45, pix: 1340.65, credito: 1373.09, debito: 375.5, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 2, dinheiro: 1521, pix: 997.2, credito: 1265.54, debito: 1060.79, voucher: 700, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 3, dinheiro: 3354.92, pix: 2694.71, credito: 2836.8, debito: 2432.62, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 4, dinheiro: 2131, pix: 1088.01, credito: 706.41, debito: 1275.39, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 5, dinheiro: 1699, pix: 1138, credito: 587.78, debito: 904.74, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 6, dinheiro: 710, pix: 1016.77, credito: 499.37, debito: 562.91, voucher: 0, crediario: 34.1, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 7, dinheiro: 865, pix: 1325.2, credito: 1051.97, debito: 545.34, voucher: 0, crediario: 480.29, recebParcDinheiro: 0, recebParcPix: 0 },
].map((d) => ({ ...d, totalVendas: d.dinheiro + d.pix + d.credito + d.debito + d.voucher + d.crediario }));

const AGOSTO_TOTAIS = {
  dinheiro: 12769.37, pix: 9600.54, credito: 8320.96, debito: 7157.29, voucher: 700, crediario: 514.39,
  recebParcDinheiro: 0, recebParcPix: 0,
  totalVendas: 39062.55,
};

const DESPESAS_AGOSTO = [
  { dia: 1, desc: "Taxa matança", valor: 528, tipo: "PIX" },
  { dia: 5, desc: "Sistema", valor: 860, tipo: "PIX" },
  { dia: 6, desc: "Funcionários (Carla)", valor: 480.82, tipo: "PIX" },
  { dia: 6, desc: "Funcionários (João Pedro)", valor: 447.7, tipo: "PIX" },
  { dia: 6, desc: "Funcionários (Jadson)", valor: 400.02, tipo: "PIX" },
  { dia: 6, desc: "Lâmina serra", valor: 183.88, tipo: "PIX" },
  { dia: 6, desc: "Internet", valor: 81.51, tipo: "PIX" },
  { dia: 7, desc: "Funcionários (Jaime Vitor)", valor: 1559.5, tipo: "PIX" },
  { dia: 8, desc: "Máquina Infinity Pay", valor: 199, tipo: "PIX" },
  { dia: 8, desc: "Taxa matança", valor: 513.2, tipo: "PIX" },
  { dia: 3, desc: "Flanelas e canetas", valor: 12.3, tipo: "Dinheiro" },
  { dia: 4, desc: "Segurança VIP", valor: 30, tipo: "Dinheiro" },
  { dia: 5, desc: "Almoço", valor: 23, tipo: "Dinheiro" },
  { dia: 6, desc: "Descarga do boi", valor: 80, tipo: "Dinheiro" },
  { dia: 7, desc: "Água sem nota", valor: 8, tipo: "Dinheiro" },
  { dia: 7, desc: "Sacos de lixo", valor: 16.3, tipo: "Dinheiro" },
  { dia: 7, desc: "Almoço (Jadson)", valor: 20, tipo: "Dinheiro" },
  { dia: 2, desc: "Vale (Jadson)", valor: 50, tipo: "Dinheiro" },
];

const COMPRAS_AGOSTO = [
  { dia: 1, desc: "Porco", info: "89,03 kg", valor: 1335.5, tipo: "PIX" },
  { dia: 1, desc: "Boi e coxões", info: "185 kg + colchão", valor: 3279, tipo: "PIX" },
  { dia: 3, desc: "Boleto Avigro", valor: 154.78, tipo: "Boleto" },
  { dia: 4, desc: "Ovos", valor: 85, tipo: "PIX" },
  { dia: 4, desc: "Boleto BRF", valor: 574.28, tipo: "Boleto" },
  { dia: 4, desc: "Boleto BRF", valor: 284.99, tipo: "Boleto" },
  { dia: 5, desc: "Frango (Cilene)", valor: 93.87, tipo: "PIX" },
  { dia: 5, desc: "Porco (Zé de Saty)", info: "56,15 kg", valor: 828, tipo: "PIX" },
  { dia: 5, desc: "Boi (Vanderilei)", info: "57,09 @", valor: 13496.13, tipo: "Boleto" },
  { dia: 7, desc: "Frango (Cilene)", valor: 54, tipo: "PIX" },
  { dia: 7, desc: "Boleto BRF", valor: 202.05, tipo: "PIX" },
  { dia: 8, desc: "10 fardos de água", valor: 110, tipo: "PIX" },
  { dia: 8, desc: "Boleto BRF", valor: 278.32, tipo: "Boleto" },
  { dia: 5, desc: "Boi (Vanderilei)", valor: 2050, tipo: "Dinheiro" },
  { dia: 7, desc: "Bebidas (Heineken + lata)", valor: 120.8, tipo: "Dinheiro" },
];

const FECHAMENTO_AGOSTO = {
  totalGeral: { dinheiro: 12769.37, pixStone: 9600.54, cartao: 16178.25, total: 38548.16 },
  despesas: { dinheiro: 239.6, pixStone: 4541.43, total: 4781.03 },
  compras: { dinheiro: 2170.8, pixStone: 20665.92, total: 22836.72 },
  saldo: { dinheiro: 10358.97, pixStone: 571.44, total: 10930.41 },
  saldoOnlineContaEm: "07/08",
  saldoOnline: { dinheiro: 4526, dinheiroDiff: -1637.71, stone: 4766.7, total: 9292.7 },
};

const RESUMO_MENSAL = [
  { mes: "Março", entrada: 41876, saida: 5922, compras: 56810, saldo: -20856 },
  { mes: "Abril", entrada: 86666, saida: 19593, compras: 92359, saldo: -25286 },
  { mes: "Maio", entrada: 123532.61, saida: 18069, compras: 82000, saldo: 23463.61 },
  { mes: "Junho", entrada: 136869, saida: 14660, compras: 62587, saldo: 59622 },
  { mes: "Julho", entrada: 129966, saida: 14990, compras: 66494, saldo: 48482 },
];
const RESUMO_MEDIA = { entrada: 103781.92, saida: 14646.8, compras: 72050, saldo: 17085.12 };
const RESUMO_EXTRA = { saldoAgo: -15828, debito: -48260, saldoOnline: 5000, aReceber: 3000 };

const CONTAS_A_PAGAR = [
  { categoria: "Pró-labore (sócios)", planejado: 6000, realizado: 0, itens: ["Jaime — 2.000", "Edcarlos — 2.000", "Fabinho — 2.000"] },
  { categoria: "Folha de pessoal", planejado: 7058, realizado: 0, itens: ["Jaime Victor — 1.621", "Carla — 1.621", "Jadson — 1.621", "Edson — 1.621", "Hora extra"] },
  { categoria: "Sistemas", planejado: 287, realizado: 0, itens: ["Sistema Caixa — 287 (trimestral, pago em agosto: 860)"] },
  { categoria: "Serviços prestados", planejado: 1000, realizado: 0, itens: [] },
  { categoria: "Bens duráveis", planejado: 1000, realizado: 0, itens: [] },
  { categoria: "Material de expediente", planejado: 500, realizado: 0, itens: ["Limpeza — 250", "Escritório — 200", "Água — 50"] },
  { categoria: "Impostos e taxas", planejado: 1321.18, realizado: 0, itens: ["DAE — 106,35", "DAS Simples Nacional — 714,83", "Máquina Infinity — 250", "NexfitPay — 250"] },
  { categoria: "Fixas / consumo", planejado: 4589.34, realizado: 178, itens: ["Aluguel — 3.263,50", "Energia — 862,61", "Água/esgoto — 43,23", "Celular — 60", "Internet — 60", "Contador — 300"] },
  { categoria: "Outros", planejado: 300, realizado: 0, itens: [] },
];

const BOLETOS_A_PAGAR = [
  { compra: new Date(2026, 7, 3), fornecedor: "Fornecedor de porco", produto: "Porco", valor: 637.2, vencimento: new Date(2026, 7, 13), pago: false },
  { compra: new Date(2026, 7, 3), fornecedor: "Fornecedor de porco", produto: "Porco", valor: 4312, vencimento: new Date(2026, 7, 13), pago: false },
  { compra: new Date(2026, 7, 4), fornecedor: "Fornecedor de boi", produto: "Boi", valor: 23708, vencimento: new Date(2026, 7, 14), pago: false },
];

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
