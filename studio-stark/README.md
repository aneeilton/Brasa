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
| Barbeiros, horários, endereço, WhatsApp | `src/config.js` |
| Serviços e preços | tabela `servicos` no Supabase (ou `src/config.js` no modo demonstração) |
| Banco de dados | `supabase/schema.sql` |
| Fotos dos barbeiros | `public/barbeiros/` (quadradas, exibidas em círculo) |
| Logomarca | `src/assets/logo.svg` (extraída do PDF oficial) |
| Cores, tipografia, espaçamentos | `src/styles.css` (tokens no topo; modo escuro automático) |
| Gravação de dados | `src/lib/store.js` |

## Telas

- **Início** — logo, escolha do barbeiro pela foto, próximo horário do cliente, funcionamento.
- **Agendar** (3 etapas) — serviços (pode somar mais de um) → dia e horário → confirmar.
  O cadastro (nome e sobrenome, WhatsApp, e-mail) é pedido **só no primeiro agendamento**.
- **Meus horários** — próximos e histórico, cancelar, adicionar ao calendário, editar dados.
- **Agenda da equipe** (`#/equipe`) — login, agenda por dia e barbeiro, lembrete por WhatsApp, concluir / faltou / cancelar.
- **Painel do negócio** (só para gestores) — faturamento realizado e previsto com comparação ao
  período anterior, ticket médio, ocupação, faltas, movimento por dia, desempenho por barbeiro,
  serviços mais pedidos, horários de pico e clientes sumidos com botão para chamar no WhatsApp.
  Para liberar: `update public.equipe set gestor = true where email = '...';`

## Ligar ao Supabase (agenda compartilhada)

O app já vem ligado ao Supabase (endereço e chave pública em `src/config.js`). Para rodar em **modo demonstração** (dados só no aparelho, PIN `1234`), use `npx vite --mode demo`.
Para valer de verdade:

1. **Banco:** no projeto Supabase → *SQL Editor* → *New query* → cole todo o
   `supabase/schema.sql` → *Run*. Cria tabelas, regras de segurança, funções e o catálogo.
2. **Chaves:** *Project Settings → API* → copie a *Project URL* e a chave
   *anon / publishable*. Coloque em `.env.local` (veja `.env.example`) e nas
   variáveis de ambiente da Vercel (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
3. **Equipe:** *Authentication → Users → Add user* (e-mail + senha, “Auto Confirm”) e
   depois, no SQL Editor: `insert into public.equipe (email) values ('email@dele.com');`
4. **Recomendado:** *Authentication → Sign In / Providers* → desative “Allow new users to sign up”.

**Preços e serviços** passam a ser editados no próprio Supabase (*Table Editor → servicos*):
mudar preço, duração, descrição ou desativar (`ativo = false`) aparece no app na hora.

### Como a segurança funciona
- Cliente não faz login: no 1º agendamento recebe um código secreto guardado só no aparelho
  dele; “Meus horários” e “Cancelar” só funcionam com esse código.
- O público só vê **quais horários estão ocupados**, nunca nomes ou telefones.
- Preço e duração são calculados no servidor; o banco recusa dois clientes no mesmo horário,
  dias/horários fora do funcionamento e mais de 3 horários futuros por WhatsApp.
- A agenda (com nomes e telefones) só abre para e-mails cadastrados na tabela `equipe`.
