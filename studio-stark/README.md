# Studio Stark · Agendamento

App web (PWA) de agendamento do **Studio Stark Barber & Shop**, feito com React + Vite.

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera /dist para publicar
```

Na Vercel/Netlify, aponte o *Root Directory* para `studio-stark/`.

## Onde mexer

| O quê | Arquivo |
| --- | --- |
| Serviços, preços, durações, barbeiros, horários, endereço, PIN | `src/config.js` |
| Fotos dos barbeiros (hoje ilustrativas) | `public/barbeiros/` — troque o arquivo e o caminho em `config.js` (retrato 4:5) |
| Logomarca | `src/assets/logo.svg` (extraída do PDF oficial) |
| Cores, tipografia, espaçamentos | `src/styles.css` (tokens no topo; modo escuro automático) |
| Gravação de dados | `src/lib/store.js` |

## Telas

- **Início** — logo, escolha do barbeiro pela foto, próximo horário do cliente, funcionamento.
- **Agendar** (3 etapas) — serviços (pode somar mais de um) → dia e horário → confirmar.
  O cadastro (nome e sobrenome, WhatsApp, e-mail) é pedido **só no primeiro agendamento**.
- **Meus horários** — próximos e histórico, cancelar, adicionar ao calendário, editar dados.
- **Agenda da equipe** (`#/equipe`) — agenda por dia e barbeiro, botão de lembrete por WhatsApp, concluir/cancelar.

## Limitação importante (protótipo)

Os dados ficam **no próprio aparelho** (localStorage). Para uso real, o agendamento feito
pelo celular do cliente precisa aparecer no celular do barbeiro — isso exige um backend
(sugestão: Supabase). Toda a leitura/gravação está isolada em `src/lib/store.js`, então a
troca não mexe nas telas. O PIN da equipe também é só uma trava visual até existir login real.
