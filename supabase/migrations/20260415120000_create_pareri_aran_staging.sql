-- Migration: pareri_aran_staging
-- Tabella redazionale per il ciclo di vita dei pareri ARAN.
-- Il frontend pubblico NON legge questa tabella: legge solo aran.pareri.json.
-- Accesso: solo utenti ADMIN tramite RLS.

CREATE TABLE IF NOT EXISTS pareri_aran_staging (
  record_id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aran_id                        TEXT NOT NULL,
  version_no                     INTEGER NOT NULL DEFAULT 1,
  supersedes_record_id           UUID REFERENCES pareri_aran_staging(record_id),
  is_current                     BOOLEAN NOT NULL DEFAULT FALSE,

  codici_secondari               TEXT[],
  data_pubblicazione             TEXT,
  titolo                         TEXT,
  quesito                        TEXT NOT NULL,
  risposta                       TEXT NOT NULL DEFAULT '',
  url_fonte                      TEXT,
  hash_contenuto                 TEXT NOT NULL,
  argomenti                      TEXT[],
  hash_tags_argomento            TEXT[],
  riferimenti_normativi_estratti TEXT[],
  articoli_collegati             TEXT[],
  schede_collegate               TEXT[],

  stato                          TEXT NOT NULL DEFAULT 'draft'
                                   CHECK (stato IN ('draft','review','published','discarded')),
  parse_status                   TEXT NOT NULL DEFAULT 'ok'
                                   CHECK (parse_status IN ('ok','warning','error')),
  qa_flags                       TEXT[],
  needs_editorial_review         BOOLEAN NOT NULL DEFAULT FALSE,
  note_admin                     TEXT,

  created_at                     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Garanzia: un solo record is_current=true per aranId
CREATE UNIQUE INDEX IF NOT EXISTS idx_pareri_aran_current_per_aran
  ON pareri_aran_staging(aran_id)
  WHERE is_current = TRUE;

-- Indice per query frequenti
CREATE INDEX IF NOT EXISTS idx_pareri_aran_staging_aran_id ON pareri_aran_staging(aran_id);
CREATE INDEX IF NOT EXISTS idx_pareri_aran_staging_stato ON pareri_aran_staging(stato);

-- Trigger per updated_at automatico
CREATE OR REPLACE FUNCTION update_pareri_aran_staging_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pareri_aran_staging_updated_at
  BEFORE UPDATE ON pareri_aran_staging
  FOR EACH ROW EXECUTE FUNCTION update_pareri_aran_staging_updated_at();

-- RLS
ALTER TABLE pareri_aran_staging ENABLE ROW LEVEL SECURITY;

-- Solo gli ADMIN possono leggere e scrivere
-- Utilizziamo la funzione helper SECURITY DEFINER get_my_role() per evitare problemi di ricorsione e visibilità.
-- La funzione legge il ruolo direttamente da user_app_state in modo sicuro.
CREATE POLICY "pareri_aran_admin_only" ON pareri_aran_staging
  FOR ALL
  USING ( public.get_my_role() = 'ADMIN' )
  WITH CHECK ( public.get_my_role() = 'ADMIN' );

COMMENT ON TABLE pareri_aran_staging IS
  'Dataset redazionale pareri ARAN. Non letto dal frontend pubblico. Aggiornato solo da script CLI e pannello admin.';
COMMENT ON COLUMN pareri_aran_staging.aran_id IS
  'ID numerico ARAN (es. 37131): chiave canonica del parere.';
COMMENT ON COLUMN pareri_aran_staging.record_id IS
  'UUID tecnico: chiave primaria del record. Stabile per tutta la vita del record.';
COMMENT ON COLUMN pareri_aran_staging.is_current IS
  'true = versione inclusa nel dataset pubblico JSON. Un solo record per aran_id.';
COMMENT ON COLUMN pareri_aran_staging.codici_secondari IS
  'Alias ricercabili storici, es. ["CFL72", "CFL 72", "RAL431"]. Non sono chiavi.';
