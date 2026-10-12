/* ============================================================
   CONFIGURAÇÃO DA BARBEARIA — Studio Stark
   Tudo que muda com frequência (serviços, preços, horários,
   barbeiros, fotos) fica aqui. Não é preciso mexer no resto.
   ============================================================ */

export const BARBEARIA = {
  nome: "Studio Stark",
  subtitulo: "Barber & Shop",
  // Preencha quando tiver os dados — aparecem na tela inicial e na confirmação.
  endereco: "",
  whatsapp: "", // ex.: "5511999999999" (com DDI 55 + DDD)
  instagram: "", // ex.: "studiostark"
};

/* Fotos: troque os arquivos em /public/barbeiros por fotos reais
   (ex.: jhonys.jpg) e atualize o caminho abaixo. Formato ideal: retrato 4:5. */
export const BARBEIROS = [
  { id: "jhonys", nome: "Jhonys", foto: "/barbeiros/jhonys.svg", destaque: "Degradê e navalhado" },
  { id: "diego", nome: "Diego", foto: "/barbeiros/diego.svg", destaque: "Corte na tesoura e barba" },
];

/* Funcionamento: terça a sábado, 08:00–12:00 e 14:00–18:00. */
export const FUNCIONAMENTO = {
  diasDaSemana: [2, 3, 4, 5, 6], // 0 = domingo … 6 = sábado
  periodos: [
    { nome: "Manhã", inicio: "08:00", fim: "12:00" },
    { nome: "Tarde", inicio: "14:00", fim: "18:00" },
  ],
  intervaloMin: 15, // de quanto em quanto tempo os horários são oferecidos
  antecedenciaMin: 30, // não permite agendar com menos de X minutos de antecedência
  diasAFrente: 30, // até quantos dias à frente o cliente pode agendar
};

/* Serviços — preço em reais, duração em minutos. */
export const CATEGORIAS = [
  {
    id: "cortes",
    nome: "Cortes",
    servicos: [
      { id: "degrade", nome: "Degradê", preco: 25, duracao: 30 },
      { id: "tesoura", nome: "Corte só na tesoura", preco: 40, duracao: 30 },
      { id: "navalhado", nome: "Navalhado", preco: 30, duracao: 35 },
      { id: "pigmentacao", nome: "Corte com pigmentação", preco: 60, duracao: 40 },
      { id: "crianca", nome: "Corte em criança", preco: 60, duracao: 50 },
    ],
  },
  {
    id: "combos",
    nome: "Combos",
    servicos: [
      { id: "corte-sobrancelha", nome: "Corte + Sobrancelha", preco: 30, duracao: 40 },
      { id: "corte-bigode", nome: "Corte + Bigode", preco: 30, duracao: 35 },
      { id: "corte-barba", nome: "Corte + Barba", preco: 40, duracao: 40 },
      { id: "navalhado-sobrancelha", nome: "Navalhado + Sobrancelha", preco: 40, duracao: 40 },
      { id: "corte-barba-sobrancelha", nome: "Corte + Barba + Sobrancelha", preco: 50, duracao: 45 },
    ],
  },
  {
    id: "barba",
    nome: "Barba e acabamento",
    servicos: [
      { id: "barba", nome: "Barba", preco: 20, duracao: 10 },
      { id: "bigode", nome: "Bigode", preco: 5, duracao: 5 },
      { id: "pezinho", nome: "Pezinho", preco: 10, duracao: 10 },
      { id: "sobrancelha", nome: "Sobrancelha", preco: 10, duracao: 10 },
    ],
  },
  {
    id: "tratamentos",
    nome: "Tratamentos",
    servicos: [
      { id: "lavagem", nome: "Lavagem de cabelo", preco: 10, duracao: 10 },
      { id: "hidratacao", nome: "Hidratação", preco: 20, duracao: 10 },
      { id: "botox", nome: "Botox", preco: 60, duracao: 40 },
      { id: "nevou", nome: "Nevou", preco: 100, duracao: 45 },
    ],
  },
  {
    id: "assinaturas",
    nome: "Assinaturas mensais",
    nota: "Valor mensal. Agende cada visita por aqui normalmente.",
    servicos: [
      { id: "ass-corte", nome: "Assinatura mensal · Corte", preco: 89.9, duracao: 30, assinatura: true },
      { id: "ass-barba", nome: "Assinatura mensal · Barba", preco: 69.9, duracao: 20, assinatura: true },
      { id: "ass-corte-barba", nome: "Assinatura mensal · Corte + Barba", preco: 149.9, duracao: 45, assinatura: true },
    ],
  },
];

export const SERVICOS = CATEGORIAS.flatMap((c) => c.servicos);
export const servicoPorId = (id) => SERVICOS.find((s) => s.id === id);
export const barbeiroPorId = (id) => BARBEIROS.find((b) => b.id === id);

/* PIN da área da equipe (#/agenda). Isto é só uma trava visual — veja o README:
   segurança de verdade exige login no servidor. */
export const PIN_EQUIPE = "1234";
