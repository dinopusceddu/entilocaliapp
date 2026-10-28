-- Preserve the historical table and rows while retiring its outbound integration.
ALTER TABLE public.registrazioni_calcolo_fondo DISABLE TRIGGER "Make";

ALTER TABLE public.registrazioni_calcolo_fondo ENABLE ROW LEVEL SECURITY;

-- No client policies are added. TRUNCATE is covered by the privilege revoke, not RLS.
-- service_role retains only direct SELECT; the table owner keeps its owner privileges.
REVOKE ALL PRIVILEGES ON TABLE public.registrazioni_calcolo_fondo FROM PUBLIC, anon, authenticated, service_role;
GRANT SELECT ON TABLE public.registrazioni_calcolo_fondo TO service_role;
