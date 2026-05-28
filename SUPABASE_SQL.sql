-- ================================================================
-- 15 MINUTOS — Script SQL para o Supabase
-- Cole este conteúdo no SQL Editor do Supabase e clique em "Run"
-- ================================================================

-- 1. Tabela de usuários
create table if not exists usuarios (
  id uuid default gen_random_uuid() primary key,
  nome text not null,
  email text not null unique,
  created_at timestamptz default now()
);

-- 2. Tabela de sessões (fichas de 15 min)
create table if not exists sessoes (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references usuarios(id) on delete cascade,
  data date not null,
  atividade text not null,
  estado text,
  intencao text,
  minimo text,
  resultado text,
  tempo_real integer,
  sentimento text,
  humor integer check (humor between 1 and 5),
  vitoria text,
  created_at timestamptz default now()
);

-- 3. Tabela de dias (organização diária)
create table if not exists dias (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references usuarios(id) on delete cascade,
  data date not null,
  numero integer not null,
  tarefa1 text,
  tarefa2 text,
  tarefa3 text,
  intencao1 text,
  intencao2 text,
  gratidao text,
  noite_funcionou text,
  noite_melhorar text,
  noite_amanha text,
  humor integer check (humor between 1 and 5),
  feito boolean default false,
  created_at timestamptz default now(),
  unique(usuario_id, data)
);

-- 4. Tabela de revisões semanais
create table if not exists semanas (
  id uuid default gen_random_uuid() primary key,
  usuario_id uuid references usuarios(id) on delete cascade,
  numero integer not null,
  dias_feitos integer check (dias_feitos between 1 and 7),
  obstaculo text,
  vitoria text,
  manter text,
  mudar text,
  foco_proxima text,
  nota integer check (nota between 1 and 10),
  mensagem text,
  created_at timestamptz default now(),
  unique(usuario_id, numero)
);

-- 5. Segurança: Row Level Security (cada usuário vê só os seus dados)
alter table usuarios enable row level security;
alter table sessoes enable row level security;
alter table dias enable row level security;
alter table semanas enable row level security;

-- Políticas: acesso público por enquanto (sem autenticação complexa)
-- Os dados são separados por usuario_id na lógica do app

create policy "Acesso público usuários" on usuarios for all using (true) with check (true);
create policy "Acesso público sessões" on sessoes for all using (true) with check (true);
create policy "Acesso público dias" on dias for all using (true) with check (true);
create policy "Acesso público semanas" on semanas for all using (true) with check (true);
