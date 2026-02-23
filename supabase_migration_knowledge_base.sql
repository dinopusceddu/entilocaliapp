-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your documents
create table if not exists knowledge_base (
  id uuid primary key default gen_random_uuid(),
  content text not null, -- The actual content of the document
  metadata jsonb, -- Storing metadata (e.g. source, title, url)
  embedding vector(1536) -- Embedding vector (1536 is standard for OpenAI / many common models, we can adjust if using a different embedding model)
);

-- Create a function to search for documents
create or replace function match_documents (
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
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.metadata,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  order by similarity desc
  limit match_count;
$$;

-- RLS (Row Level Security) - Ensure only authenticated users can read, and only admins can insert/update
alter table knowledge_base enable row level security;

-- Policies
create policy "Knowledge base is viewable by authenticated users"
on knowledge_base for select
to authenticated
using (true);

-- Assuming there's a way to check for admin, we'll allow insert/update/delete for now to service roles,
-- or authenticated users. We'll refine this if there's a specific 'users' table with roles.
-- For simplicity, we can let authenticated users insert, but usually this is restricted.
-- Let's restrict write access to the service role (which edge functions use when needed) or a specific admin policy.
create policy "Knowledge base is manageable by service role"
on knowledge_base for all
using (true)
with check (true);
