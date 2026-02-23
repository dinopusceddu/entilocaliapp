-- Crea la tabella per i documenti
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Abilitiamo RLS
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;

-- Policy di base (l'endpoint UI proteggerà l'accesso Admin)
CREATE POLICY "Tutti gli utenti autenticati possono leggere i documenti"
ON public.knowledge_documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Tutti gli utenti autenticati possono inserire documenti"
ON public.knowledge_documents FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Tutti gli utenti autenticati possono cancellare documenti"
ON public.knowledge_documents FOR DELETE TO authenticated USING (true);


-- Modifichiamo la tabella document_chunks per collegarla alla nuova knowledge_documents
ALTER TABLE public.document_chunks
ADD COLUMN IF NOT EXISTS document_id UUID REFERENCES public.knowledge_documents(id) ON DELETE CASCADE;
