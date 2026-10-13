-- Diagnóstico do login da equipe — cole no SQL Editor e clique em Run.
-- Mostra cada usuário criado em Authentication → Users e se ele pode entrar na agenda.
select
  u.email,
  u.email_confirmed_at is not null as email_confirmado,
  e.email is not null              as liberado_na_agenda,
  u.last_sign_in_at                as ultimo_login
from auth.users u
left join public.equipe e on e.email = lower(u.email)
order by u.email;

-- Correção (rode só se a consulta acima mostrar "false"):
-- update auth.users set email_confirmed_at = now()
--   where email_confirmed_at is null
--     and lower(email) in ('jhonys@studiostark.com', 'diego@studiostark.com');
-- insert into public.equipe (email) values ('jhonys@studiostark.com'), ('diego@studiostark.com')
--   on conflict (email) do nothing;
