-- Apaga TODOS os dados fictícios criados por demo-setembro.sql
-- (clientes com e-mail @demo.studiostark.com e os agendamentos deles).
-- Não toca em clientes ou agendamentos reais.
delete from public.clientes where email like '%@demo.studiostark.com';
