-- ============================================================
--  Studio Stark · Agendamento — banco de dados (Supabase)
--  Cole este arquivo inteiro em: Supabase → SQL Editor → New query → Run.
--  Pode rodar de novo sem problema (é idempotente).
--
--  Segurança:
--  • Clientes não fazem login. Cada cliente recebe um "token" secreto no
--    primeiro agendamento, guardado só no aparelho dele. Tudo que o cliente
--    faz passa por funções que conferem esse token.
--  • Ninguém de fora lê nomes/telefones: o público só enxerga os horários
--    ocupados (sem dados pessoais).
--  • A equipe entra com e-mail e senha (Supabase Auth) e precisa estar
--    na tabela `equipe`.
--  • Dois agendamentos no mesmo horário do mesmo barbeiro são impossíveis:
--    o próprio banco recusa (constraint `sem_sobreposicao`).
-- ============================================================

create extension if not exists btree_gist with schema extensions;

-- ---------- Catálogo ----------
create table if not exists public.barbeiros (
  id    text primary key,
  nome  text not null,
  ativo boolean not null default true,
  ordem int not null default 0
);

create table if not exists public.servicos (
  id        text primary key,
  categoria text not null,
  nome      text not null,
  descricao text,
  preco     numeric(8,2) not null check (preco >= 0),
  duracao   int not null check (duracao between 5 and 240),
  ordem     int not null default 0,
  ativo     boolean not null default true
);

-- ---------- Clientes e agendamentos ----------
create table if not exists public.clientes (
  id        uuid primary key default gen_random_uuid(),
  token     uuid not null unique default gen_random_uuid(),
  nome      text not null,
  whatsapp  text not null,
  email     text not null,
  criado_em timestamptz not null default now()
);
create index if not exists clientes_whatsapp_idx on public.clientes (whatsapp);

create table if not exists public.agendamentos (
  id             uuid primary key default gen_random_uuid(),
  barbeiro_id    text not null references public.barbeiros(id),
  cliente_id     uuid not null references public.clientes(id) on delete cascade,
  inicio         timestamp not null,  -- horário local da barbearia
  fim            timestamp not null,
  servicos       text[] not null,
  servicos_nomes text[] not null,
  total          numeric(8,2) not null,
  status         text not null default 'confirmado'
                 check (status in ('confirmado', 'concluido', 'cancelado', 'faltou')),
  criado_em      timestamptz not null default now(),
  check (fim > inicio)
);
create index if not exists agendamentos_inicio_idx on public.agendamentos (inicio);
create index if not exists agendamentos_cliente_idx on public.agendamentos (cliente_id);

do $$ begin
  alter table public.agendamentos add constraint sem_sobreposicao
    exclude using gist (barbeiro_id with =, tsrange(inicio, fim) with &&)
    where (status <> 'cancelado');
exception when duplicate_object or duplicate_table then null;
end $$;

-- ---------- Equipe (quem pode ver a agenda) ----------
create table if not exists public.equipe (
  email text primary key check (email = lower(email))
);

-- ---------- Configuração de funcionamento ----------
-- Fica nas funções abaixo: terça a sábado, 08–12 e 14–18, a cada 15 min,
-- até 30 dias à frente, no mínimo 30 min de antecedência, fuso da Bahia.

-- ============================================================
--  RLS: tudo fechado por padrão; só o necessário é aberto.
-- ============================================================
alter table public.barbeiros    enable row level security;
alter table public.servicos     enable row level security;
alter table public.clientes     enable row level security;
alter table public.agendamentos enable row level security;
alter table public.equipe       enable row level security;

create or replace function public.is_equipe()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.equipe e
    where e.email = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

drop policy if exists "catalogo publico" on public.barbeiros;
create policy "catalogo publico" on public.barbeiros
  for select to anon, authenticated using (ativo or (select public.is_equipe()));

drop policy if exists "catalogo publico" on public.servicos;
create policy "catalogo publico" on public.servicos
  for select to anon, authenticated using (ativo or (select public.is_equipe()));

drop policy if exists "equipe gerencia barbeiros" on public.barbeiros;
create policy "equipe gerencia barbeiros" on public.barbeiros
  for all to authenticated using ((select public.is_equipe())) with check ((select public.is_equipe()));

drop policy if exists "equipe gerencia servicos" on public.servicos;
create policy "equipe gerencia servicos" on public.servicos
  for all to authenticated using ((select public.is_equipe())) with check ((select public.is_equipe()));

drop policy if exists "equipe le clientes" on public.clientes;
create policy "equipe le clientes" on public.clientes
  for select to authenticated using ((select public.is_equipe()));

drop policy if exists "equipe le agendamentos" on public.agendamentos;
create policy "equipe le agendamentos" on public.agendamentos
  for select to authenticated using ((select public.is_equipe()));

drop policy if exists "equipe atualiza agendamentos" on public.agendamentos;
create policy "equipe atualiza agendamentos" on public.agendamentos
  for update to authenticated using ((select public.is_equipe())) with check ((select public.is_equipe()));

-- Sem políticas em `equipe`: ninguém lê ou altera pela API.

-- ============================================================
--  Funções públicas (o que o app do cliente pode fazer)
-- ============================================================

-- Agora, no fuso da barbearia.
create or replace function public.agora_local()
returns timestamp language sql stable set search_path = ''
as $$ select (now() at time zone 'America/Bahia')::timestamp $$;

-- Horários ocupados (sem dados pessoais).
create or replace function public.horarios_ocupados(p_de date, p_ate date)
returns table (barbeiro_id text, inicio timestamp, fim timestamp)
language sql stable security definer set search_path = ''
as $$
  select a.barbeiro_id, a.inicio, a.fim
  from public.agendamentos a
  where a.status <> 'cancelado'
    and a.inicio >= p_de and a.inicio < p_ate + 1
    and p_ate - p_de <= 62;
$$;

-- Formato devolvido ao app do cliente.
create or replace function public._agendamento_json(a public.agendamentos, c public.clientes)
returns json language sql immutable set search_path = ''
as $$
  select json_build_object(
    'id', a.id,
    'barbeiroId', a.barbeiro_id,
    'data', to_char(a.inicio, 'YYYY-MM-DD'),
    'hora', to_char(a.inicio, 'HH24:MI'),
    'duracao', (extract(epoch from a.fim - a.inicio) / 60)::int,
    'servicos', a.servicos,
    'servicosNomes', a.servicos_nomes,
    'total', a.total,
    'status', a.status,
    'cliente', json_build_object('nome', c.nome, 'whatsapp', c.whatsapp, 'email', c.email)
  );
$$;

create or replace function public._validar_cliente(p_nome text, p_whatsapp text, p_email text)
returns void language plpgsql immutable set search_path = ''
as $$
begin
  if array_length(regexp_split_to_array(btrim(p_nome), '\s+'), 1) < 2 or length(btrim(p_nome)) > 80 then
    raise exception 'NOME_INVALIDO' using hint = 'Digite nome e sobrenome.';
  end if;
  if p_whatsapp !~ '^\d{10,11}$' then
    raise exception 'WHATSAPP_INVALIDO' using hint = 'Digite o WhatsApp com DDD.';
  end if;
  if p_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$' or length(p_email) > 120 then
    raise exception 'EMAIL_INVALIDO' using hint = 'Digite um e-mail válido.';
  end if;
end $$;

create or replace function public.criar_agendamento(
  p_token     uuid,
  p_nome      text,
  p_whatsapp  text,
  p_email     text,
  p_barbeiro  text,
  p_inicio    timestamp,
  p_servicos  text[]
)
returns json
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_cliente public.clientes;
  v_ag      public.agendamentos;
  v_dur     int;
  v_total   numeric;
  v_nomes   text[];
  v_qtd     int;
  v_fim     timestamp;
  v_agora   timestamp := public.agora_local();
begin
  perform public._validar_cliente(p_nome, p_whatsapp, p_email);

  if not exists (select 1 from public.barbeiros where id = p_barbeiro and ativo) then
    raise exception 'BARBEIRO_INVALIDO';
  end if;

  -- Preço e duração vêm do banco, nunca do aparelho.
  select sum(s.duracao), sum(s.preco), array_agg(s.nome order by x.ord), count(*)
    into v_dur, v_total, v_nomes, v_qtd
  from unnest(p_servicos) with ordinality as x(id, ord)
  join public.servicos s on s.id = x.id and s.ativo;
  if coalesce(v_qtd, 0) = 0 or v_qtd <> cardinality(p_servicos)
     or cardinality(p_servicos) <> (select count(distinct u) from unnest(p_servicos) u) then
    raise exception 'SERVICO_INVALIDO';
  end if;

  v_fim := p_inicio + make_interval(mins => v_dur);

  -- Regras de funcionamento.
  if extract(isodow from p_inicio) not between 2 and 6
     or extract(minute from p_inicio)::int % 15 <> 0
     or extract(second from p_inicio) <> 0
     or not (
       (p_inicio::time >= '08:00' and v_fim <= p_inicio::date + time '12:00')
       or (p_inicio::time >= '14:00' and v_fim <= p_inicio::date + time '18:00')
     ) then
    raise exception 'FORA_DO_HORARIO';
  end if;
  if p_inicio < v_agora + interval '30 minutes' or p_inicio::date > v_agora::date + 30 then
    raise exception 'FORA_DO_PRAZO';
  end if;

  -- Freio contra abuso: no máximo 3 horários futuros por WhatsApp.
  if (select count(*) from public.agendamentos a join public.clientes c on c.id = a.cliente_id
      where c.whatsapp = p_whatsapp and a.status = 'confirmado' and a.inicio > v_agora) >= 3 then
    raise exception 'LIMITE_AGENDAMENTOS';
  end if;

  -- Cliente: reaproveita pelo token; senão cria um novo.
  select * into v_cliente from public.clientes where token = p_token;
  if found then
    update public.clientes
       set nome = btrim(p_nome), whatsapp = p_whatsapp, email = lower(btrim(p_email))
     where id = v_cliente.id
     returning * into v_cliente;
  else
    insert into public.clientes (nome, whatsapp, email)
    values (btrim(p_nome), p_whatsapp, lower(btrim(p_email)))
    returning * into v_cliente;
  end if;

  begin
    insert into public.agendamentos (barbeiro_id, cliente_id, inicio, fim, servicos, servicos_nomes, total)
    values (p_barbeiro, v_cliente.id, p_inicio, v_fim, p_servicos, v_nomes, v_total)
    returning * into v_ag;
  exception when exclusion_violation then
    raise exception 'HORARIO_OCUPADO';
  end;

  return json_build_object('token', v_cliente.token, 'agendamento', public._agendamento_json(v_ag, v_cliente));
end $$;

create or replace function public.meus_agendamentos(p_token uuid)
returns json
language sql stable security definer set search_path = ''
as $$
  select coalesce(json_agg(public._agendamento_json(a, c) order by a.inicio desc), '[]'::json)
  from public.clientes c
  join public.agendamentos a on a.cliente_id = c.id
  where c.token = p_token
    and a.inicio > public.agora_local() - interval '180 days';
$$;

create or replace function public.cancelar_meu_agendamento(p_token uuid, p_id uuid)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  update public.agendamentos a
     set status = 'cancelado'
    from public.clientes c
   where a.id = p_id and a.cliente_id = c.id and c.token = p_token
     and a.status = 'confirmado' and a.inicio > public.agora_local();
  if not found then
    raise exception 'NAO_ENCONTRADO';
  end if;
end $$;

create or replace function public.atualizar_cliente(p_token uuid, p_nome text, p_whatsapp text, p_email text)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
begin
  perform public._validar_cliente(p_nome, p_whatsapp, p_email);
  update public.clientes
     set nome = btrim(p_nome), whatsapp = p_whatsapp, email = lower(btrim(p_email))
   where token = p_token;
end $$;

-- Permissões: só as funções públicas ficam acessíveis ao app.
revoke all on function public.is_equipe() from public;
revoke all on function public.agora_local() from public;
revoke all on function public.horarios_ocupados(date, date) from public;
revoke all on function public._agendamento_json(public.agendamentos, public.clientes) from public, anon, authenticated;
revoke all on function public._validar_cliente(text, text, text) from public, anon, authenticated;
revoke all on function public.criar_agendamento(uuid, text, text, text, text, timestamp, text[]) from public;
revoke all on function public.meus_agendamentos(uuid) from public;
revoke all on function public.cancelar_meu_agendamento(uuid, uuid) from public;
revoke all on function public.atualizar_cliente(uuid, text, text, text) from public;

grant execute on function public.is_equipe() to anon, authenticated;
grant execute on function public.horarios_ocupados(date, date) to anon, authenticated;
grant execute on function public.criar_agendamento(uuid, text, text, text, text, timestamp, text[]) to anon, authenticated;
grant execute on function public.meus_agendamentos(uuid) to anon, authenticated;
grant execute on function public.cancelar_meu_agendamento(uuid, uuid) to anon, authenticated;
grant execute on function public.atualizar_cliente(uuid, text, text, text) to anon, authenticated;

-- ============================================================
--  Dados iniciais
-- ============================================================
insert into public.barbeiros (id, nome, ordem) values
  ('jhonys', 'Jhonys', 1),
  ('diego',  'Diego',  2)
on conflict (id) do nothing;

insert into public.servicos (id, categoria, nome, descricao, preco, duracao, ordem) values
  ('degrade',                 'Cortes',             'Degradê',                     null, 25, 30, 10),
  ('tesoura',                 'Cortes',             'Corte só na tesoura',         null, 40, 30, 11),
  ('navalhado',               'Cortes',             'Navalhado',                   null, 30, 35, 12),
  ('pigmentacao',             'Cortes',             'Corte com pigmentação',       null, 60, 40, 13),
  ('crianca',                 'Cortes',             'Corte em criança',            null, 60, 50, 14),
  ('corte-sobrancelha',       'Combos',             'Corte + Sobrancelha',         null, 30, 40, 20),
  ('corte-bigode',            'Combos',             'Corte + Bigode',              null, 30, 35, 21),
  ('corte-barba',             'Combos',             'Corte + Barba',               null, 40, 40, 22),
  ('navalhado-sobrancelha',   'Combos',             'Navalhado + Sobrancelha',     null, 40, 40, 23),
  ('corte-barba-sobrancelha', 'Combos',             'Corte + Barba + Sobrancelha', null, 50, 45, 24),
  ('barba',                   'Barba e acabamento', 'Barba',                       null, 20, 10, 30),
  ('bigode',                  'Barba e acabamento', 'Bigode',                      null,  5,  5, 31),
  ('pezinho',                 'Barba e acabamento', 'Pezinho',                     null, 10, 10, 32),
  ('sobrancelha',             'Barba e acabamento', 'Sobrancelha',                 null, 10, 10, 33),
  ('lavagem',                 'Tratamentos',        'Lavagem de cabelo',           null, 10, 10, 40),
  ('hidratacao',              'Tratamentos',        'Hidratação',                  null, 20, 10, 41),
  ('botox',                   'Tratamentos',        'Botox',                       null, 60, 40, 42),
  ('nevou',                   'Tratamentos',        'Nevou', 'Pintura do cabelo na cor branca', 100, 45, 43)
on conflict (id) do nothing;

-- Para liberar a agenda a alguém da equipe:
--   1) Authentication → Users → Add user (e-mail + senha, marque "Auto Confirm").
--   2) Rode:  insert into public.equipe (email) values ('email@exemplo.com');
