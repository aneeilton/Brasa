/* ============================================================
   DADOS DO PAINEL — Note Brasa Nobre
   Este é o ÚNICO arquivo que muda na atualização diária.
   Para atualizar: apague TUDO daqui e cole o conteúdo novo
   que o Claude te mandar. Não precisa mexer em mais nada.
   ============================================================ */


/* ---------------- DATA SNAPSHOT (da planilha "Note Brasa Nobre") ---------------- */
/* Atualizado a partir do arquivo/link enviado. Para atualizar, envie a planilha ou o link de novo. */
/* "Hoje" usado para calcular vencimentos: */
const HOJE = new Date(2026, 7, 31); // 31 de agosto de 2026
const ULTIMA_ATUALIZACAO = new Date(2026, 7, 31); // atualize esta linha toda vez que os dados forem atualizados

/* "Vendido no dia" = Dinheiro + Pix + Crédito + Débito + Voucher + Crediário (bate com a linha RESUMO DIA da planilha). */
/* recebParc = pagamentos de fiado recebidos no dia — entram no caixa, mas NÃO contam como venda nova (a venda já foi contada quando foi feita a fiado). */
const AGOSTO_DIAS = [
  { dia: 1, dinheiro: 2488.45, pix: 1340.65, credito: 1373.09, debito: 375.5, voucher: 0, crediario: 433.56, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 2, dinheiro: 1521, pix: 997.2, credito: 1265.54, debito: 1060.79, voucher: 700, crediario: 74.66, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 3, dinheiro: 3354.92, pix: 2694.71, credito: 2836.8, debito: 2432.62, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 4, dinheiro: 2131, pix: 1088.01, credito: 706.41, debito: 1275.39, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 5, dinheiro: 1699, pix: 1138, credito: 587.78, debito: 904.74, voucher: 0, crediario: 45.69, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 6, dinheiro: 710, pix: 1016.77, credito: 499.37, debito: 562.91, voucher: 0, crediario: 34.1, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 7, dinheiro: 865, pix: 1325.2, credito: 1051.97, debito: 545.34, voucher: 0, crediario: 480.29, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 8, dinheiro: 3460, pix: 2662.15, credito: 1537.77, debito: 1577.79, voucher: 131.44, crediario: 271.54, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 9, dinheiro: 1546, pix: 815.22, credito: 420.18, debito: 284.25, voucher: 0, crediario: 353.55, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 10, dinheiro: 1090, pix: 1376.2, credito: 192.24, debito: 75.07, voucher: 0, crediario: 37.01, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 11, dinheiro: 1417, pix: 619, credito: 365.47, debito: 118.88, voucher: 0, crediario: 190.76, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 12, dinheiro: 980, pix: 890.07, credito: 224.3, debito: 362.31, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 13, dinheiro: 670, pix: 1136.28, credito: 332.21, debito: 234.57, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 14, dinheiro: 1640, pix: 1248.63, credito: 514.33, debito: 449.42, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 15, dinheiro: 7060, pix: 2687.98, credito: 1721.69, debito: 1475.45, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 16, dinheiro: 990, pix: 1938.02, credito: 616.95, debito: 797.53, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 17, dinheiro: 1040, pix: 657.49, credito: 244.92, debito: 101.35, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 18, dinheiro: 1054, pix: 218.19, credito: 93.14, debito: 275.59, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 19, dinheiro: 865, pix: 822.23, credito: 248.24, debito: 244.7, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 20, dinheiro: 938, pix: 1139.47, credito: 228.24, debito: 236.43, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 21, dinheiro: 2306.22, pix: 1057.24, credito: 1934.34, debito: 810.06, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 22, dinheiro: 2190, pix: 1848.92, credito: 1744.74, debito: 874.9, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 23, dinheiro: 860, pix: 734.33, credito: 684.26, debito: 344.04, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 24, dinheiro: 1320, pix: 1165.13, credito: 0, debito: 347.61, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 25, dinheiro: 1120, pix: 630.43, credito: 230.99, debito: 257.15, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 26, dinheiro: 446, pix: 494.56, credito: 164.5, debito: 567.92, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 27, dinheiro: 1594, pix: 224.27, credito: 154.73, debito: 128.06, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 28, dinheiro: 2100, pix: 3066.53, credito: 1319.35, debito: 226.83, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 29, dinheiro: 2560, pix: 1730.24, credito: 2418.34, debito: 965.24, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 30, dinheiro: 1250, pix: 988.55, credito: 389.63, debito: 224.86, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
  { dia: 31, dinheiro: 1120, pix: 794.5, credito: 604.08, debito: 273.47, voucher: 0, crediario: 0, recebParcDinheiro: 0, recebParcPix: 0 },
].map((d) => ({ ...d, totalVendas: d.dinheiro + d.pix + d.credito + d.debito + d.voucher + d.crediario }));
const AGOSTO_TOTAIS = {
  dinheiro: 52385.59, pix: 38546.17, credito: 24705.6, debito: 18410.77, voucher: 831.44, crediario: 1921.16,
  recebParcDinheiro: 0, recebParcPix: 0,
  totalVendas: 136800.73,
};

const DESPESAS_AGOSTO = [
  { dia: 1, desc: "Taxa Matança", valor: 528, tipo: "PIX" },
  { dia: 5, desc: "Sistema", valor: 860, tipo: "PIX" },
  { dia: 6, desc: "Funcionários (Carla)", valor: 480.82, tipo: "PIX" },
  { dia: 6, desc: "Funcionários (João Pedro)", valor: 447.7, tipo: "PIX" },
  { dia: 6, desc: "Funcionários (Jadson)", valor: 400.02, tipo: "PIX" },
  { dia: 6, desc: "Lâmina Serra", valor: 183.88, tipo: "PIX" },
  { dia: 6, desc: "Internet", valor: 81.51, tipo: "PIX" },
  { dia: 7, desc: "Funcionários (Jaime Vitor)", valor: 1559.5, tipo: "PIX" },
  { dia: 8, desc: "Máquina Infinity Pay", valor: 199, tipo: "PIX" },
  { dia: 8, desc: "Taxa Matança", valor: 513.2, tipo: "PIX" },
  { dia: 9, desc: "João Pedro", valor: 250, tipo: "PIX" },
  { dia: 10, desc: "Plastificação", valor: 4, tipo: "PIX" },
  { dia: 10, desc: "Lâmpadas", valor: 67.23, tipo: "PIX" },
  { dia: 10, desc: "Embasa", valor: 337.26, tipo: "PIX" },
  { dia: 11, desc: "Bobina", valor: 256.3, tipo: "PIX" },
  { dia: 11, desc: "GTA Boi", valor: 18.72, tipo: "PIX" },
  { dia: 12, desc: "Taxa Matança", valor: 525.84, tipo: "PIX" },
  { dia: 14, desc: "Vale Jadson", valor: 75, tipo: "PIX" },
  { dia: 16, desc: "João Pedro", valor: 300, tipo: "PIX" },
  { dia: 17, desc: "Sacola", valor: 174, tipo: "PIX" },
  { dia: 17, desc: "Sacola", valor: 75, tipo: "PIX" },
  { dia: 17, desc: "Jandira Contabilidade", valor: 500, tipo: "PIX" },
  { dia: 17, desc: "Quinzena Carla", valor: 889, tipo: "PIX" },
  { dia: 17, desc: "Aneilton Finanças", valor: 1500, tipo: "PIX" },
  { dia: 17, desc: "Troca Dinheiro", valor: 450, tipo: "PIX" },
  { dia: 21, desc: "Lâmina Serra", valor: 50, tipo: "PIX" },
  { dia: 21, desc: "Das Mensal", valor: 302.09, tipo: "PIX" },
  { dia: 25, desc: "Taxa Matança", valor: 869.56, tipo: "PIX" },
  { dia: 25, desc: "Sacolas", valor: 55, tipo: "PIX" },
  { dia: 26, desc: "Spray Tinta", valor: 30.21, tipo: "PIX" },
  { dia: 29, desc: "Aneilton Finanças", valor: 500, tipo: "PIX" },
  { dia: 31, desc: "Pagamento Jaiminho (Parte 2)", valor: 5675, tipo: "PIX" },
  { dia: 31, desc: "Sacolas, Balas, Fumo", valor: 281, tipo: "PIX" },
  { dia: 3, desc: "Flanelas e Canetas", valor: 12.3, tipo: "Dinheiro" },
  { dia: 3, desc: "Pagamento Jaiminho (Parte Do Pagamento)", valor: 5675, tipo: "Dinheiro" },
  { dia: 4, desc: "Segurança VIP", valor: 30, tipo: "Dinheiro" },
  { dia: 5, desc: "Almoço Fun", valor: 23, tipo: "Dinheiro" },
  { dia: 6, desc: "Descarga Boi", valor: 80, tipo: "Dinheiro" },
  { dia: 7, desc: "Água Sem Nota", valor: 8, tipo: "Dinheiro" },
  { dia: 7, desc: "Sacos de Lixo", valor: 16.3, tipo: "Dinheiro" },
  { dia: 7, desc: "Almoço Jadson", valor: 20, tipo: "Dinheiro" },
  { dia: 2, desc: "Vale Jdson", valor: 50, tipo: "Dinheiro" },
  { dia: 10, desc: "Almoço Fun", valor: 25, tipo: "Dinheiro" },
  { dia: 17, desc: "Aluguel", valor: 5000, tipo: "Dinheiro" },
  { dia: 19, desc: "Sal de Gado", valor: 15, tipo: "Dinheiro" },
  { dia: 20, desc: "Descarga Boi", valor: 80, tipo: "Dinheiro" },
  { dia: 22, desc: "Almoço Func", valor: 20, tipo: "Dinheiro" },
  { dia: 25, desc: "Raid", valor: 17.5, tipo: "Dinheiro" },
  { dia: 27, desc: "Descarga Boi", valor: 80, tipo: "Dinheiro" },
  { dia: 28, desc: "Remédio João Pedro", valor: 10.04, tipo: "Dinheiro" },
  { dia: 28, desc: "Almoço Func", valor: 22, tipo: "Dinheiro" },
  { dia: 30, desc: "Ariston", valor: 8, tipo: "Dinheiro" },
  { dia: 31, desc: "Produto Limpeza", valor: 28, tipo: "Dinheiro" },
  { dia: 31, desc: "Almoço Func", valor: 22, tipo: "Dinheiro" },
  { dia: 31, desc: "Pão", valor: 2.5, tipo: "Dinheiro" },
];

const COMPRAS_AGOSTO = [
  { dia: 1, desc: "Porco - Kg (R$  89,03)", valor: 1335.5, tipo: "PIX" },
  { dia: 1, desc: "Boi E Coxões (185,00KG + COLCHÃO)", valor: 3279, tipo: "PIX" },
  { dia: 3, desc: "Boleto Avigro", valor: 154.78, tipo: "Boleto" },
  { dia: 4, desc: "Ovos", valor: 85, tipo: "PIX" },
  { dia: 4, desc: "Boleto Brf", valor: 574.28, tipo: "Boleto" },
  { dia: 4, desc: "Boleto Brf", valor: 284.99, tipo: "Boleto" },
  { dia: 4, desc: "Boleto Avigro", valor: 325.37, tipo: "PIX" },
  { dia: 5, desc: "Frango Cilene", valor: 93.87, tipo: "PIX" },
  { dia: 5, desc: "Porco Zé de Saty - Kg (R$  56,15)", valor: 828, tipo: "PIX" },
  { dia: 5, desc: "Boi Vanderilei (R$  57,09)", valor: 13496.13, tipo: "Boleto" },
  { dia: 7, desc: "Frango Cilene -Kg", valor: 54, tipo: "PIX" },
  { dia: 7, desc: "Boleto Brf (SABER PRODUTO)", valor: 202.05, tipo: "PIX" },
  { dia: 8, desc: "10 Fardos Água", valor: 110, tipo: "PIX" },
  { dia: 8, desc: "Boleto Brf", valor: 278.32, tipo: "Boleto" },
  { dia: 10, desc: "Boi Lucas", valor: 7060, tipo: "PIX" },
  { dia: 10, desc: "Boleto Petropolis", valor: 144.3, tipo: "Boleto" },
  { dia: 10, desc: "Boleto Avigro", valor: 154.78, tipo: "Boleto" },
  { dia: 10, desc: "Boleto Avigro", valor: 324.94, tipo: "Boleto" },
  { dia: 11, desc: "Porco Maxuel (182KG)", valor: 800, tipo: "PIX" },
  { dia: 12, desc: "Porco Maxuel", valor: 248, tipo: "PIX" },
  { dia: 13, desc: "Boleto Brf", valor: 590.52, tipo: "Boleto" },
  { dia: 14, desc: "Frango Cilene Kg (Semana Retrasada)", valor: 109.42, tipo: "PIX" },
  { dia: 17, desc: "Pão De Alho", valor: 130, tipo: "PIX" },
  { dia: 17, desc: "Boleto Brf", valor: 278.39, tipo: "Boleto" },
  { dia: 17, desc: "Boleto Avigro", valor: 154.84, tipo: "Boleto" },
  { dia: 18, desc: "Boi de Vanderlei (57,08@ + RESTANTE DO OUTRO BOI)", valor: 9400, tipo: "PIX" },
  { dia: 19, desc: "Boleto Jbs (65,26 JUROS)", valor: 1355.25, tipo: "Boleto" },
  { dia: 20, desc: "Frango Cilene (6KG)", valor: 63, tipo: "PIX" },
  { dia: 20, desc: "Boleto Norsa", valor: 527.3, tipo: "Boleto" },
  { dia: 20, desc: "Porco Maxuel (60/56+FATOS)", valor: 1000, tipo: "PIX" },
  { dia: 21, desc: "Sal Jefinho", valor: 74.4, tipo: "PIX" },
  { dia: 21, desc: "Carnes Fabinho Pediu Pra Pagar (N INFORMOU)", valor: 1100, tipo: "PIX" },
  { dia: 22, desc: "Frango Cilene (2.37+20.6KG)", valor: 130.96, tipo: "PIX" },
  { dia: 23, desc: "Boleto Revalle", valor: 291.93, tipo: "Boleto" },
  { dia: 24, desc: "Boleto Petropolis", valor: 112.7, tipo: "Boleto" },
  { dia: 24, desc: "Boi Vanderlei", valor: 9000, tipo: "PIX" },
  { dia: 25, desc: "Boleto Jbs", valor: 399.8, tipo: "Boleto" },
  { dia: 29, desc: "João Pedro Boi (17@)", valor: 5100, tipo: "PIX" },
  { dia: 29, desc: "Frango Cilene (7,665KG)", valor: 80.48, tipo: "PIX" },
  { dia: 29, desc: "Mini Pizzas", valor: 100, tipo: "PIX" },
  { dia: 7, desc: "01 Pack Heinken Long + 01 Pack Lata", valor: 120.8, tipo: "Dinheiro" },
  { dia: 5, desc: "Boi Vanderilei", valor: 2050, tipo: "Dinheiro" },
  { dia: 12, desc: "Porco Maxuel", valor: 1400, tipo: "Dinheiro" },
  { dia: 12, desc: "Boi De Lucas Rest", valor: 12525, tipo: "Dinheiro" },
  { dia: 12, desc: "Czs Produtos", valor: 334.15, tipo: "Dinheiro" },
  { dia: 14, desc: "Pé De Moleque", valor: 35, tipo: "Dinheiro" },
  { dia: 18, desc: "Boi Vanderlei 57.08@ + Rest", valor: 5600, tipo: "Dinheiro" },
  { dia: 21, desc: "Porco Maxuel (Restante)", valor: 656, tipo: "Dinheiro" },
  { dia: 22, desc: "Carneiro", valor: 540, tipo: "Dinheiro" },
  { dia: 24, desc: "Boi Vanderlei", valor: 6000, tipo: "Dinheiro" },
  { dia: 26, desc: "Carneiro Zé Ailton", valor: 1006, tipo: "Dinheiro" },
  { dia: 31, desc: "Boi Vanderlei Restante", valor: 7000, tipo: "Dinheiro" },
];

const FECHAMENTO_AGOSTO = {
  totalGeral: { dinheiro: 52385.59, pixStone: 38546.17, cartao: 43947.81, total: 134879.57 },
  despesas: { dinheiro: 11244.64, pixStone: 18438.84, total: 29683.48 },
  compras: { dinheiro: 37266.95, pixStone: 59832.3, total: 97099.25 },
  saldo: { dinheiro: 3874, pixStone: 4222.84, total: 8096.84 },
  saldoOnlineContaEm: "31/08",
  saldoOnline: { dinheiro: 11047.96, stone: 2674.46, total: 13722.42 },
};

/* Transferências entre o dinheiro físico (caixa) e o saldo em conta.
   tipo "deposito" = dinheiro saiu do caixa físico e entrou na conta.
   tipo "saque" = dinheiro saiu da conta e entrou no caixa físico. */
const TRANSFERENCIAS_ESPECIE_CONTA = [
  { dia: 7, valor: 2519.4, tipo: "deposito" },
];

const RESUMO_MENSAL = [
  { mes: "Março", entrada: 41876, saida: 5922, compras: 56810, saldo: -20856 },
  { mes: "Abril", entrada: 86666, saida: 19593, compras: 92359, saldo: -25286 },
  { mes: "Maio", entrada: 123532.61, saida: 18069, compras: 82000, saldo: 23463.61 },
  { mes: "Junho", entrada: 136869, saida: 14660, compras: 62587, saldo: 59622 },
  { mes: "Julho", entrada: 129966, saida: 14990, compras: 66494, saldo: 48482 },
  { mes: "Agosto", entrada: 134859.17, saida: 29683.48, compras: 97099.25, saldo: 8076.44 },
];
const RESUMO_MEDIA = { entrada: 108961.36, saida: 17152.91, compras: 76224.88, saldo: 15583.57 };
const RESUMO_EXTRA = { saldoAgo: -15828, debito: -48260, saldoOnline: 5000, aReceber: 3000 };

const CONTAS_A_PAGAR = [
  { categoria: "Pró-labore (sócios)", planejado: 6000, realizado: 0, itens: ["Jaime — 2.000", "Edcarlos — 2.000", "Fabinho — 2.000"] },
  { categoria: "Folha de pessoal", planejado: 7058, realizado: 0, itens: ["Jaime Victor — 1.621", "Carla — 1.621", "Jadson — 1.621", "Edson — 1.621", "Hora extra"] },
  { categoria: "Sistemas", planejado: 287, realizado: 0, itens: ["Sistema Caixa — 287 (trimestral, pago em agosto: 860)"] },
  { categoria: "Serviços prestados", planejado: 1000, realizado: 0, itens: [] },
  { categoria: "Bens duráveis", planejado: 1000, realizado: 0, itens: [] },
  { categoria: "Material de expediente", planejado: 500, realizado: 0, itens: ["Limpeza — 250", "Escritório — 200", "Água — 50"] },
  { categoria: "Impostos e taxas", planejado: 301.1, realizado: 0, itens: ["DAE — imposto de compra suple", "DAS Simples Nacional — 301,10 (venc. 20/08)", "Máquina Infinity", "NexfitPay"] },
  { categoria: "Fixas / consumo", planejado: 918.77, realizado: 0, itens: ["Aluguel", "Energia Elétrica/Solar", "Água/esgoto — 337,26 (pago 09/08)", "Plano celular", "Internet — 81,51 (pago 09/08)", "Contador — 500 (pagamento mensal, a pagar)"] },
  { categoria: "Outros", planejado: 300, realizado: 0, itens: [] },
];

const BOLETOS_A_PAGAR = [
  { compra: new Date(2026, 7, 7), fornecedor: "Avigro", produto: "Frango (parcela 2/3)", valor: 153.99, vencimento: new Date(2026, 8, 14), pago: false },
  { compra: new Date(2026, 7, 7), fornecedor: "Avigro", produto: "Frango (parcela 3/3)", valor: 158.66, vencimento: new Date(2026, 8, 21), pago: false },
  { compra: new Date(2026, 7, 9), fornecedor: "CR Fibra", produto: "Internet", valor: 79.9, vencimento: new Date(2026, 8, 9), pago: false },
  { compra: new Date(2026, 7, 9), fornecedor: "Embasa", produto: "Água", valor: 136.85, vencimento: new Date(2026, 8, 9), pago: false },
  { compra: new Date(2026, 7, 9), fornecedor: "Embasa", produto: "Água", valor: 129.94, vencimento: new Date(2026, 9, 9), pago: false },
  { compra: new Date(2026, 7, 9), fornecedor: "Comércia/PRB", produto: "Mercadoria diversa", valor: 1233, vencimento: new Date(2026, 8, 30), pago: false },
  { compra: new Date(2026, 7, 9), fornecedor: "GP/Petropolis", produto: "Cerveja", valor: 101.5, vencimento: new Date(2026, 8, 14), pago: false },
  { compra: new Date(2026, 7, 9), fornecedor: "Solar/Coca", produto: "Refrigerante (parcela 1/2)", valor: 469.77, vencimento: new Date(2026, 8, 12), pago: false },
  { compra: new Date(2026, 7, 9), fornecedor: "Solar/Coca", produto: "Refrigerante (parcela 2/2)", valor: 469.77, vencimento: new Date(2026, 8, 12), pago: false },
];

export {
  HOJE, ULTIMA_ATUALIZACAO, AGOSTO_DIAS, AGOSTO_TOTAIS, DESPESAS_AGOSTO, COMPRAS_AGOSTO,
  FECHAMENTO_AGOSTO, TRANSFERENCIAS_ESPECIE_CONTA, RESUMO_MENSAL, RESUMO_MEDIA, RESUMO_EXTRA,
  CONTAS_A_PAGAR, BOLETOS_A_PAGAR,
};
