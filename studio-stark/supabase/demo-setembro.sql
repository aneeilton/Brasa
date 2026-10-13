-- ============================================================
--  DADOS FICTÍCIOS — setembro de 2026, só para apresentação.
--  Cole no Supabase → SQL Editor → Run.
--
--  • Cria ~45 clientes fictícios (e-mail terminando em @demo.studiostark.com)
--    e os agendamentos deles em setembro, para Jhonys e Diego.
--  • Não mexe em nada real. Rodar de novo não duplica: ele limpa a demo antes.
--  • Para apagar tudo depois:  supabase/limpar-demo.sql
--  • Os telefones são fictícios — não use o botão "Chamar" nesses clientes.
-- ============================================================
do $$
declare
  nomes text[] := array[
    'Lucas Almeida','Pedro Santos','João Lima','Rafael Souza','Bruno Costa','Mateus Rocha',
    'Gabriel Dias','Thiago Alves','Felipe Nunes','André Melo','Caio Reis','Vitor Ramos',
    'Igor Lopes','Hugo Teles','Renan Silva','Davi Moura','Enzo Cruz','Otávio Pinto',
    'Samuel Brito','Daniel Freitas','Leonardo Barros','Gustavo Cardoso','Henrique Moreira','Marcos Vieira',
    'Ricardo Teixeira','Eduardo Gomes','Fernando Ribeiro','Rodrigo Martins','Alexandre Araújo','Paulo Batista',
    'Carlos Mendes','Murilo Castro','Wesley Santana','Jonathan Lopes','Kaique Oliveira','Luan Ferreira',
    'Ítalo Nascimento','Yuri Carvalho','Erick Monteiro','Breno Farias','Ruan Pereira','Emanuel Costa',
    'Arthur Rezende','Heitor Campos','Miguel Andrade'];
  -- Serviço principal, repetido conforme a procura.
  principais text[] := array[
    'degrade','degrade','degrade','degrade','degrade','degrade',
    'corte-barba','corte-barba','corte-barba','corte-barba','corte-barba',
    'corte-barba-sobrancelha','corte-barba-sobrancelha','corte-barba-sobrancelha','corte-barba-sobrancelha',
    'navalhado','navalhado','navalhado','corte-sobrancelha','corte-sobrancelha','corte-sobrancelha',
    'tesoura','tesoura','barba','barba','barba','pigmentacao','crianca','nevou','corte-bigode',
    'navalhado-sobrancelha','botox','hidratacao'];
  extras text[] := array['lavagem','sobrancelha','pezinho','barba'];
  ids uuid[] := '{}';
  v_id uuid;
  dia date;
  b text;
  per int[];
  t int;
  chance float;
  servs text[];
  dur int;
  tot numeric;
  nms text[];
  cli uuid;
  st text;
  r float;
  i int;
begin
  perform setseed(0.42);

  -- Limpa uma demo anterior (apaga em cascata os agendamentos dela).
  delete from public.clientes where email like '%@demo.studiostark.com';

  for i in 1 .. array_length(nomes, 1) loop
    insert into public.clientes (nome, whatsapp, email, criado_em)
    values (nomes[i], '759900' || lpad(i::text, 5, '0'), 'cliente' || i || '@demo.studiostark.com',
            timestamp '2026-08-20 10:00' + (i || ' hours')::interval)
    returning id into v_id;
    ids := ids || v_id;
  end loop;

  for dia in select d::date from generate_series(date '2026-09-01', date '2026-09-30', interval '1 day') d loop
    continue when extract(isodow from dia) not between 2 and 6;
    foreach b in array array['jhonys', 'diego'] loop
      foreach per slice 1 in array array[[480, 720], [840, 1080]] loop
        t := per[1];
        while t < per[2] loop
          chance := case when b = 'jhonys' then 0.55 else 0.45 end
                  + case extract(isodow from dia) when 6 then 0.25 when 5 then 0.12 else 0 end
                  + case when t >= 960 then 0.10 when t < 540 then -0.12 else 0 end;
          if random() < chance then
            servs := array[principais[1 + floor(random() * array_length(principais, 1))::int]];
            if random() < 0.15 then
              servs := servs || extras[1 + floor(random() * array_length(extras, 1))::int];
              if servs[1] = servs[2] then servs := servs[1:1]; end if;
            end if;
            select sum(s.duracao), sum(s.preco), array_agg(s.nome order by x.o)
              into dur, tot, nms
              from unnest(servs) with ordinality x(id, o) join public.servicos s on s.id = x.id;
            exit when t + dur > per[2];
            -- Clientes fiéis aparecem mais (distribuição puxada para os primeiros da lista).
            i := 1 + floor(power(random(), 1.7) * array_length(ids, 1))::int;
            -- Os últimos 12 da lista só vêm no início do mês: viram "clientes sumidos" no painel.
            if i > 33 and dia > date '2026-09-11' then
              i := 1 + floor(random() * 33)::int;
            end if;
            cli := ids[i];
            r := random();
            st := case when r < 0.88 then 'concluido' when r < 0.94 then 'faltou' else 'cancelado' end;
            begin
              insert into public.agendamentos
                (barbeiro_id, cliente_id, inicio, fim, servicos, servicos_nomes, total, status, criado_em)
              values
                (b, cli, dia + make_interval(mins => t), dia + make_interval(mins => t + dur),
                 servs, nms, tot, st, dia - ((1 + floor(random() * 6))::int || ' days')::interval);
            exception when exclusion_violation then
              null; -- já havia um agendamento real nesse horário: pula
            end;
            t := t + ceil(dur / 15.0)::int * 15;
          else
            t := t + 15;
          end if;
        end loop;
      end loop;
    end loop;
  end loop;
end $$;

-- Resumo do que foi criado:
select count(*) as agendamentos,
       count(*) filter (where status = 'concluido') as concluidos,
       sum(total) filter (where status = 'concluido') as faturamento
from public.agendamentos a join public.clientes c on c.id = a.cliente_id
where c.email like '%@demo.studiostark.com';
