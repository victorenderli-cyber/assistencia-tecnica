-- AssiTec RB — banco compartilhado (Supabase, grátis)
-- Rode 1x no SQL Editor do seu projeto Supabase.

create table if not exists casos (
  id text primary key,
  cliente text not null,
  data text,
  classe text,
  modelo text,
  defeito text not null,
  solucao text not null,
  criado_em bigint not null
);

alter table casos enable row level security;

-- Acesso público via chave ANON (a chave anon é feita para ir no front-end).
-- Quem tiver a URL do projeto consegue ler/gravar: ideal para uso interno da loja.
drop policy if exists "public all" on casos;
create policy "public all" on casos
  for all using (true) with check (true);
