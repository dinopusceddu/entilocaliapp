-- Abilita l'estensione pgvector (necessario per salvare i numeri/vettori di OpenAI)
create extension if not exists vector;

-- Crea la tabella per conservare i frammenti di testo (chunks) del tuo manuale
create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  content text not null,               -- Il testo effettivo del paragrafo
  metadata jsonb,                      -- Eventuali informazioni extra (es. nome capitolo, pagina)
  embedding vector(1536)               -- Il vettore generato da OpenAI (text-embedding-3-small usa 1536 dimensioni)
);

-- Sicurezza RLS (Row Level Security) per bloccare l'accesso non autorizzato dal frontend pubblico
alter table public.document_chunks enable row level security;

-- Permettiamo al ruolo "service_role" (che usano le nostre Edge Functions/Backend) di fare tutto
create policy "Servicerole has full access"
on public.document_chunks
to service_role
using (true)
with check (true);

-- Questa è la funzione che lancia la ricerca di somiglianza. 
-- L'operatore <=> calcola la "distanza del coseno" tra i vettori.
create or replace function public.match_document_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    document_chunks.id,
    document_chunks.content,
    document_chunks.metadata,
    1 - (document_chunks.embedding <=> query_embedding) as similarity
  from document_chunks
  where 1 - (document_chunks.embedding <=> query_embedding) > match_threshold
  order by document_chunks.embedding <=> query_embedding
  limit match_count;
$$;
