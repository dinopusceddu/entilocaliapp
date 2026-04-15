import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../enums';
import { ParereAranRecord, ParereAranStato } from '../types';
import {
  AlertCircle, CheckCircle, Clock, Trash2, Eye, EyeOff,
  RefreshCw, Star, MessageSquare, Tag as TagIcon, AlertTriangle,
  Upload, FileText, ChevronRight, X
} from 'lucide-react';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { parsePareriTxt, suggestCorrelations, StagedParere } from '../utils/pareriIngestion';
import articlesData from '../data/normativa/raccolta.articles.json';
import schedeData from '../data/normativa/guida.schede.json';
import { NormativaArticle, NormativaSchedaGuida } from '../types';

/** Mappa un record Supabase (snake_case) in ParereAranRecord (camelCase) */
function mapRecord(r: any): ParereAranRecord {
  return {
    recordId: r.record_id,
    aranId: r.aran_id,
    versionNo: r.version_no,
    supersedesRecordId: r.supersedes_record_id || undefined,
    isCurrent: r.is_current,
    codiciSecondari: r.codici_secondari || undefined,
    dataPubblicazione: r.data_pubblicazione || '',
    titolo: r.titolo || undefined,
    quesito: r.quesito || '',
    risposta: r.risposta || '',
    urlFonte: r.url_fonte || undefined,
    hashContenuto: r.hash_contenuto || '',
    argomenti: r.argomenti || [],
    hashTagsArgomento: r.hash_tags_argomento || [],
    riferimentiNormativiEstratti: r.riferimenti_normativi_estratti || [],
    articoliCollegati: r.articoli_collegati || [],
    schedeCollegate: r.schede_collegate || [],
    stato: r.stato as ParereAranStato,
    parseStatus: r.parse_status,
    qaFlags: r.qa_flags || [],
    needsEditorialReview: r.needs_editorial_review,
    noteAdmin: r.note_admin || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const STATO_COLORS: Record<ParereAranStato, string> = {
  draft: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  discarded: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300',
};

const PARSE_STATUS_COLORS: Record<string, string> = {
  ok: 'text-emerald-600',
  warning: 'text-amber-600',
  error: 'text-red-600',
};

const QA_FLAG_LABELS: Record<string, string> = {
  risposta_vuota: 'Risposta vuota',
  quesito_uguale_risposta: 'Quesito = Risposta',
  split_incerto: 'Split incerto',
  hash_cambiato: 'Contenuto cambiato',
  contenuto_duplicato: 'Duplicato',
};

const ParereAdminCard: React.FC<{
  record: ParereAranRecord;
  onAction: (action: 'approve' | 'promote' | 'review' | 'discard', recordId: string) => void;
  onSave: (recordId: string, updates: Partial<ParereAranRecord>) => void;
}> = ({ record, onAction, onSave }) => {
  const [expanded, setExpanded] = useState(false);
  const [editingCodici, setEditingCodici] = useState((record.codiciSecondari || []).join(', '));
  const [editingNote, setEditingNote] = useState(record.noteAdmin || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const codici = editingCodici.split(',').map(s => s.trim()).filter(Boolean);
    await onSave(record.recordId, {
      codiciSecondari: codici.length > 0 ? codici : undefined,
      noteAdmin: editingNote || undefined,
    });
    setSaving(false);
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all shadow-sm ${
      record.needsEditorialReview
        ? 'border-amber-300 dark:border-amber-700'
        : 'border-slate-200 dark:border-slate-700'
    }`}>
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-800/80 px-4 py-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <MessageSquare size={14} className="text-slate-500" />
          <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
            ARAN #{record.aranId}
          </span>
          <span className="text-xs text-slate-400">v{record.versionNo}</span>
          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${STATO_COLORS[record.stato]}`}>
            {record.stato}
          </span>
          {record.isCurrent && (
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              current
            </span>
          )}
          {record.needsEditorialReview && (
            <span title="Richiede revisione editoriale">
              <AlertTriangle size={14} className="text-amber-500" />
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-mono ${PARSE_STATUS_COLORS[record.parseStatus]}`}>
            {record.parseStatus}
          </span>
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 underline"
          >
            {expanded ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>

      {/* QA Flags */}
      {(record.qaFlags || []).length > 0 && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-900/10 border-b border-amber-200 dark:border-amber-800 flex flex-wrap gap-1">
          {record.qaFlags!.map(flag => (
            <span key={flag} className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
              {QA_FLAG_LABELS[flag] || flag}
            </span>
          ))}
        </div>
      )}

      {/* Body */}
      <div className="px-4 py-3">
        <p className={`text-sm text-slate-700 dark:text-slate-200 leading-relaxed ${!expanded ? 'line-clamp-3' : ''}`}>
          {record.quesito}
        </p>
        {expanded && record.risposta && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">Risposta</p>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {record.risposta}
            </p>
          </div>
        )}

        {/* Argomenti */}
        {record.argomenti.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {record.argomenti.slice(0, 5).map(tag => (
              <span key={tag} className="flex items-center gap-0.5 text-[10px] bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded-full">
                <TagIcon size={9} /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Campi editabili */}
        {expanded && (
          <div className="mt-4 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Codici Secondari (separati da virgola)
              </label>
              <input
                type="text"
                value={editingCodici}
                onChange={e => setEditingCodici(e.target.value)}
                placeholder="CFL72, CFL 72, RAL431"
                className="w-full text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                Note admin
              </label>
              <textarea
                value={editingNote}
                onChange={e => setEditingNote(e.target.value)}
                rows={2}
                className="w-full text-xs px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </div>
        )}
      </div>

      {/* Azioni */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
        {record.stato === 'draft' && (
          <button
            onClick={() => onAction('approve', record.recordId)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
          >
            <CheckCircle size={12} /> Approva
          </button>
        )}
        {record.stato === 'review' && (
          <button
            onClick={() => onAction('approve', record.recordId)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold"
          >
            <CheckCircle size={12} /> Approva revisione
          </button>
        )}
        {record.stato === 'published' && !record.isCurrent && (
          <button
            onClick={() => onAction('promote', record.recordId)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
          >
            <Star size={12} /> Promuovi a Current
          </button>
        )}
        {record.stato !== 'review' && record.stato !== 'discarded' && (
          <button
            onClick={() => onAction('review', record.recordId)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 border border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg"
          >
            <Clock size={12} /> Rimanda in Review
          </button>
        )}
        {record.stato !== 'discarded' && (
          <button
            onClick={() => onAction('discard', record.recordId)}
            className="flex items-center gap-1 text-xs px-3 py-1.5 border border-red-300 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <Trash2 size={12} /> Scarta
          </button>
        )}
      </div>
    </div>
  );
};

export const AdminPareriPage: React.FC = () => {
  const { state } = useAppContext();
  const [records, setRecords] = useState<ParereAranRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filterStato, setFilterStato] = useState<string>('all');
  const [filterReview, setFilterReview] = useState(false);

  // Stato per l'ingestione file
  const [uploading, setUploading] = useState(false);
  const [ingestionResults, setIngestionResults] = useState<StagedParere[] | null>(null);
  const [ingestionStats, setIngestionStats] = useState({ nuovi: 0, modificati: 0, identici: 0 });

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('pareri_aran_staging')
        .select('*')
        .order('created_at', { ascending: false });

      if (filterStato !== 'all') {
        query = query.eq('stato', filterStato);
      }
      if (filterReview) {
        query = query.eq('needs_editorial_review', true);
      }

      const { data, error: err } = await query;
      if (err) throw err;
      setRecords((data || []).map(mapRecord));
    } catch (e: any) {
      setError(e.message || 'Errore caricamento dati');
    } finally {
      setLoading(false);
    }
  }, [filterStato, filterReview]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const handleAction = async (action: 'approve' | 'promote' | 'review' | 'discard', recordId: string) => {
    setError(null);
    setSuccess(null);

    const updates: any = {};
    if (action === 'approve') updates.stato = 'published';
    else if (action === 'review') updates.stato = 'review';
    else if (action === 'discard') updates.stato = 'discarded';
    else if (action === 'promote') {
      // Promuovi a current: step 1 — de-imposta current per stesso aranId
      const record = records.find(r => r.recordId === recordId);
      if (!record) return;

      const { error: de } = await supabase
        .from('pareri_aran_staging')
        .update({ is_current: false })
        .eq('aran_id', record.aranId)
        .eq('is_current', true);

      if (de) { setError(`Errore na de-impostazione current: ${de.message}`); return; }

      // Step 2 — imposta questo come current + published
      const { error: pr } = await supabase
        .from('pareri_aran_staging')
        .update({ is_current: true, stato: 'published' })
        .eq('record_id', recordId);

      if (pr) { setError(`Errore promozione: ${pr.message}`); return; }

      setSuccess(`Parere promosso a current. Esegui normativa:publish per aggiornare il JSON.`);
      await fetchRecords();
      return;
    }

    const { error: err } = await supabase
      .from('pareri_aran_staging')
      .update(updates)
      .eq('record_id', recordId);

    if (err) { setError(err.message); return; }
    setSuccess(`Operazione completata (${action}).`);
    await fetchRecords();
  };

  const handleSave = async (recordId: string, updates: Partial<ParereAranRecord>) => {
    const payload: any = {};
    if (updates.codiciSecondari !== undefined) payload.codici_secondari = updates.codiciSecondari;
    if (updates.noteAdmin !== undefined) payload.note_admin = updates.noteAdmin;

    const { error: err } = await supabase
      .from('pareri_aran_staging')
      .update(payload)
      .eq('record_id', recordId);

    if (err) { setError(err.message); return; }
    setSuccess('Modifiche salvate.');
    await fetchRecords();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setIngestionResults(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = await parsePareriTxt(text);
        
        // Correlazione automatica
        const correlated = parsed.map(p => {
          const { articoli, schede } = suggestCorrelations(
            p, 
            articlesData as NormativaArticle[], 
            schedeData as NormativaSchedaGuida[]
          );
          return {
            ...p,
            articoliCollegati: articoli,
            schedeCollegate: schede,
            qaFlags: p.qaFlags.length > 0 ? p.qaFlags : (articoli.length > 0 || schede.length > 0 ? ['auto_correlated'] : [])
          };
        });

        // Check con DB per distinguere nuovi/modificati
        const { data: correnti } = await supabase
          .from('pareri_aran_staging')
          .select('aran_id, hash_contenuto')
          .eq('is_current', true);

        const hashMap = new Map((correnti || []).map(c => [c.aran_id, c.hash_contenuto]));
        
        let nuovi = 0, modificati = 0, identici = 0;
        correlated.forEach(p => {
          if (!hashMap.has(p.aranId)) nuovi++;
          else if (hashMap.get(p.aranId) !== p.hashContenuto) modificati++;
          else identici++;
        });

        setIngestionStats({ nuovi, modificati, identici });
        setIngestionResults(correlated);
      } catch (err: any) {
        setError("Errore nel parsing del file: " + err.message);
      } finally {
        setUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const confirmIngestion = async () => {
    if (!ingestionResults) return;
    setUploading(true);
    setError(null);
    
    try {
      // Per ogni record, inseriamo su Supabase (logica simile a 07_stage_new_pareri.js)
      // Carichiamo le versioni attuali per incrementare versionNo
      const { data: versions } = await supabase
        .from('pareri_aran_staging')
        .select('aran_id, version_no')
        .order('version_no', { ascending: false });

      const versionMap = new Map();
      (versions || []).forEach(v => {
        if (!versionMap.has(v.aran_id)) versionMap.set(v.aran_id, v.version_no);
      });

      const toInsert = ingestionResults.filter(p => {
          // Filtriamo quelli identici per non sporcare il DB
          const currentHash = records.find(r => r.aranId === p.aranId && r.isCurrent)?.hashContenuto;
          return p.hashContenuto !== currentHash;
      });

      for (const p of toInsert) {
        const lastVersion = versionMap.get(p.aranId) || 0;
        const isNew = lastVersion === 0;

        await supabase.from('pareri_aran_staging').insert({
          aran_id: p.aranId,
          version_no: lastVersion + 1,
          data_pubblicazione: p.dataPubblicazione,
          quesito: p.quesito,
          risposta: p.risposta,
          hash_contenuto: p.hashContenuto,
          argomenti: p.argomenti,
          hash_tags_argomento: p.hashTagsArgomento,
          articoli_collegati: p.articoliCollegati,
          schede_collegate: p.schedeCollegate,
          qa_flags: p.qaFlags,
          parse_status: p.parseStatus,
          needs_editorial_review: p.needsEditorialReview || !isNew,
          stato: isNew ? 'draft' : 'review',
          is_current: false
        });
      }

      setSuccess(`Ingestione completata. ${toInsert.length} record elaborati.`);
      setIngestionResults(null);
      await fetchRecords();
    } catch (err: any) {
      setError("Errore nel salvataggio: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  if (state.currentUser.role !== UserRole.ADMIN) {
    return (
      <div className="flex justify-center items-center h-full text-red-600">
        <AlertCircle className="mr-2" /> Accesso Negato. Solo gli amministratori.
      </div>
    );
  }

  const countByStato = records.reduce<Record<string, number>>((acc, r) => {
    acc[r.stato] = (acc[r.stato] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-6 text-text-light dark:text-text-dark animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare size={24} className="text-rose-500" />
            Admin Pareri ARAN
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Revisione editoriale del dataset redazionale (Supabase).{' '}
            <span className="text-amber-600 font-medium">
              Il JSON pubblico si aggiorna solo con <code>normativa:publish</code>.
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer font-semibold shadow-sm transition-all">
            <Upload size={14} /> 
            {uploading ? 'Elaborazione...' : 'Importa TXT'}
            <input type="file" accept=".txt" onChange={handleFileUpload} className="hidden" disabled={uploading} />
          </label>
          <button
            onClick={fetchRecords}
            className="flex items-center gap-1.5 text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            <RefreshCw size={14} /> Aggiorna
          </button>
        </div>
      </div>

      {/* Anteprima Ingestione */}
      {ingestionResults && (
        <div className="bg-white dark:bg-slate-800 border-2 border-primary/30 rounded-2xl p-6 shadow-xl animate-scale-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="text-primary" /> Anteprima Ingestione
            </h3>
            <button onClick={() => setIngestionResults(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl">
              <div className="text-2xl font-bold text-emerald-600">{ingestionStats.nuovi}</div>
              <div className="text-[10px] uppercase font-bold text-emerald-700/60 tracking-wider">Nuovi Pareri</div>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl">
              <div className="text-2xl font-bold text-amber-600">{ingestionStats.modificati}</div>
              <div className="text-[10px] uppercase font-bold text-amber-700/60 tracking-wider">Aggiornamenti</div>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl opacity-60">
              <div className="text-2xl font-bold text-slate-500">{ingestionStats.identici}</div>
              <div className="text-[10px] uppercase font-bold text-slate-500/60 tracking-wider">Invariati</div>
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-2 custom-scrollbar">
            {ingestionResults.filter(p => {
               const current = records.find(r => r.aranId === p.aranId && r.isCurrent);
               return !current || current.hashContenuto !== p.hashContenuto;
            }).map(p => (
              <div key={p.aranId} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/60 rounded-lg text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold">#{p.aranId}</span>
                  <span className="text-slate-400 truncate max-w-[200px]">{p.quesito}</span>
                </div>
                <div className="flex items-center gap-2">
                  {p.articoliCollegati?.length ? (
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                      {p.articoliCollegati.length} link auto
                    </span>
                  ) : null}
                  <ChevronRight size={14} className="text-slate-300" />
                  <span className={records.some(r => r.aranId === p.aranId) ? 'text-amber-600' : 'text-emerald-600'}>
                    {records.some(r => r.aranId === p.aranId) ? 'Revisione' : 'Nuovo'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3">
            <button 
              onClick={() => setIngestionResults(null)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
            >
              Annulla
            </button>
            <button 
              onClick={confirmIngestion}
              disabled={uploading || (ingestionStats.nuovi + ingestionStats.modificati === 0)}
              className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/30 hover:scale-105 transition-all disabled:opacity-50"
            >
              {uploading ? 'Salvataggio in corso...' : 'Conferma e Inserisci Draft'}
            </button>
          </div>
        </div>
      )}

      {/* Messaggi */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 p-3 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      {/* Statistiche rapide */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {(['draft', 'review', 'published', 'discarded'] as ParereAranStato[]).map(s => (
          <div key={s} className={`rounded-xl p-3 text-center ${STATO_COLORS[s]}`}>
            <div className="text-2xl font-extrabold">{countByStato[s] || 0}</div>
            <div className="text-xs uppercase font-bold tracking-wider">{s}</div>
          </div>
        ))}
      </div>

      {/* Filtri */}
      <div className="flex flex-wrap gap-2 items-center">
        {['all', 'draft', 'review', 'published', 'discarded'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStato(s)}
            className={`text-xs px-3 py-1 rounded-full border font-medium ${
              filterStato === s
                ? 'bg-primary text-white border-primary'
                : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary'
            }`}
          >
            {s === 'all' ? 'Tutti' : s}
          </button>
        ))}
        <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 ml-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filterReview}
            onChange={e => setFilterReview(e.target.checked)}
            className="rounded"
          />
          Solo con flag QA
        </label>
      </div>

      {/* Lista record */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner text="Caricamento pareri..." />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 text-slate-400 dark:text-slate-600">
          Nessun parere trovato con i filtri selezionati.
          <p className="text-xs mt-2">Esegui <code>npm run normativa:bootstrap</code> per il primo avvio.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-xs text-slate-500">{records.length} record trovati</div>
          {records.map(record => (
            <ParereAdminCard
              key={record.recordId}
              record={record}
              onAction={handleAction}
              onSave={handleSave}
            />
          ))}
        </div>
      )}
    </div>
  );
};
