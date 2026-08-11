/* ============================================================
   DADOS DO PAINEL — Note Brasa Nobre
   Este é o ÚNICO arquivo que muda na atualização diária.
   Para atualizar: apague TUDO daqui e cole o conteúdo novo
   que o Claude te mandar. Não precisa mexer em mais nada.
   ============================================================ */


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
  { dia: 8, dinheiro: 3460, pix: 2662.15, credito: 1537.77, debito: 1577.79, voucher: 131.44, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 9, dinheiro: 1546, pix: 815.22, credito: 420.18, debito: 284.25, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
].map((d) => ({ ...d, totalVendas: d.dinheiro + d.pix + d.credito + d.debito + d.voucher + d.crediario }));

const AGOSTO_TOTAIS = {
  dinheiro: 17775.37, pix: 13077.91, credito: 10278.91, debito: 9019.33, voucher: 831.44, crediario: 514.39,
  recebParcDinheiro: 0, recebParcPix: 0,
  totalVendas: 51497.35,
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
  { dia: 9, desc: "Vale João Pedro", valor: 250, tipo: "PIX" },
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
  totalGeral: { dinheiro: 17775.37, pixStone: 13077.91, cartao: 20129.68, total: 50982.96 },
  despesas: { dinheiro: 239.6, pixStone: 4791.43, total: 5031.03 },
  compras: { dinheiro: 2170.8, pixStone: 20665.92, total: 22836.72 },
  saldo: { dinheiro: 15364.97, pixStone: 3798.81, total: 23115.21 },
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

export {
  HOJE, AGOSTO_DIAS, AGOSTO_TOTAIS, DESPESAS_AGOSTO, COMPRAS_AGOSTO,
  FECHAMENTO_AGOSTO, RESUMO_MENSAL, RESUMO_MEDIA, RESUMO_EXTRA,
  CONTAS_A_PAGAR, BOLETOS_A_PAGAR,
};