import { supabase } from '../../services/supabase';
import { IStateRepository, StateWriteResult } from '../../application/ports/IStateRepository';
import { validateMonetaryProcessing } from '../../application/input/monetaryProcessingSafety';
import { normalizeMonetaryData } from '../../domain/monetaryBoundary';
import { serializeSnapshotPayload } from '../../application/snapshots/snapshotPersistenceContract';
import { ABSENT_VERSION, isVersion, persistenceError, StatePersistenceError } from '../../application/snapshots/versionedSnapshotContract';

const representation = 'entity_id,current_year,user_id,email,role,fund_data,updated_at,b1i4_version,b1i4_expected';
export class SupabaseStateRepository implements IStateRepository {
  async getState(_userId: string | undefined, entityId: string, year: number): Promise<{ data: any | null; error: any }> {
    const res = await supabase.from('user_app_state').select('*').eq('entity_id', entityId).eq('current_year', year).maybeSingle();
    if (res.error?.code === 'PGRST116') {
      const details = String(res.error.details ?? '').toLowerCase();
      // Normalize only an explicit zero cardinality. An ambiguous message is not evidence of absence.
      if (/^(?:the result contains )?0 rows\.?$/.test(details.trim())) return { data: null, error: null };
    }
    return res;
  }
  async getAvailableYears(_userId: string | undefined, entityId: string): Promise<{ data: { current_year: number }[] | null; error: any }> {
    return await supabase.from('user_app_state').select('current_year').eq('entity_id', entityId);
  }
  /** Complete paginated map captured before a destructive confirmation, never refreshed during DELETE. */
  async getStateVersions(entityId: string): Promise<{ data: Record<string, string> | null; error: any }> {
    const versions: Record<string, string> = {};
    for (let offset = 0; ; offset += 500) {
      const res = await supabase.from('user_app_state').select('current_year,b1i4_version,fund_data').eq('entity_id', entityId).order('current_year').range(offset, offset + 499);
      if (res.error) return { data: null, error: res.error };
      if (!Array.isArray(res.data)) return { data: null, error: new StatePersistenceError('STATE_WRITE_NOT_CONFIRMED', 'Elenco annualità non confermato.') };
      for (const row of res.data) {
        if (!isVersion(row.b1i4_version)) return { data: null, error: new StatePersistenceError('STATE_VERSION_REQUIRED', 'Versioni delle annualità non disponibili.') };
        if (row.fund_data?.metadata?.snapshotStatus !== 'OPEN') return { data: null, error: new StatePersistenceError('STATE_NOT_OPEN', 'L’ente contiene annualità chiuse o storiche non eliminabili.') };
        const key = String(row.current_year);
        if (key in versions) return { data: null, error: new StatePersistenceError('STATE_WRITE_NOT_CONFIRMED', 'Elenco annualità cambiato durante il caricamento. Verifica nuovamente prima della conferma.') };
        versions[key] = row.b1i4_version;
      }
      if (res.data.length < 500) return { data: versions, error: null };
    }
  }
  async createState(data: any): Promise<StateWriteResult> {
    if (data.b1i4_expected !== ABSENT_VERSION) return { error: new StatePersistenceError('STATE_VERSION_REQUIRED', 'Creazione senza una baseline di assenza esplicita non consentita.') };
    return this.write(data, true);
  }
  async upsertState(data: any): Promise<StateWriteResult> {
    const create = data.b1i4_expected === ABSENT_VERSION;
    if (!create && !isVersion(data.b1i4_expected)) return { error: new StatePersistenceError('STATE_VERSION_REQUIRED', 'Versione caricata della bozza mancante.') };
    // No SELECT here: the operation and expected version come from the loaded draft.
    return this.write(data, create);
  }
  private async write(data: any, create: boolean): Promise<StateWriteResult> {
    const issues = validateMonetaryProcessing(data.fund_data);
    if (issues.length) return { error: { code: 'MONETARY_VALIDATION_ERROR', message: 'Importi non validi.', issues } };
    const expected = { ...data, fund_data: normalizeMonetaryData(data.fund_data) };
    try {
      const query = create ? supabase.from('user_app_state').insert(expected)
        : supabase.from('user_app_state').update(expected).eq('entity_id', expected.entity_id).eq('current_year', expected.current_year);
      const result = await query.select(representation).maybeSingle();
      if (result.error) return { error: create ? await this.classifyInsertError(result.error, expected) : persistenceError(result.error) };
      return this.confirmWrite(expected, result);
    } catch (cause) {
      return { error: new StatePersistenceError('STATE_OUTCOME_UNKNOWN', 'Il risultato del salvataggio non è disponibile. La bozza è stata conservata: verifica la versione server prima di riprovare.', cause) };
    }
  }
  async deleteState(entityId: string, year: number, expectedVersion?: string): Promise<StateWriteResult> {
    if (!isVersion(expectedVersion)) return { error: new StatePersistenceError('STATE_VERSION_REQUIRED', 'Versione dell’annualità da eliminare mancante.') };
    try {
      const result = await supabase.rpc('delete_annual_snapshot_versioned', { p_entity_id: entityId, p_year: year, p_version: expectedVersion });
      if (result.error) return { error: persistenceError(result.error) };
      if (result.data?.success !== true || result.data.deleted !== 1) return { error: new StatePersistenceError('STATE_WRITE_NOT_CONFIRMED', 'Cancellazione non confermata. Nessuna riga rimossa dalla vista.') };
      return { data: result.data, error: null };
    } catch (cause) { return { error: new StatePersistenceError('STATE_OUTCOME_UNKNOWN', 'Esito cancellazione non disponibile. Verifica prima di riprovare.', cause) }; }
  }
  async deleteStatesByEntity(_entityId: string): Promise<{ error: any }> {
    return { error: new StatePersistenceError('STATE_VERSION_REQUIRED', 'La cancellazione massiva senza mappa delle versioni è disabilitata.') };
  }
  private async classifyInsertError(error: any, expected: any): Promise<any> {
    if (error?.code !== '23505') return persistenceError(error);
    // This classifier is called only for INSERT with an explicit loaded absence baseline.
    if (expected.b1i4_expected !== ABSENT_VERSION || typeof expected.entity_id !== 'string'
      || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(expected.entity_id)
      || !Number.isSafeInteger(expected.current_year)
      || error.message !== 'duplicate key value violates unique constraint "user_app_state_pkey"') return error;
    const key = typeof error.details === 'string'
      ? error.details.match(/^Key \(entity_id, current_year\)=\(([^,]+), ([^)]+)\) already exists\.$/) : null;
    if (error.details != null) {
      if (!key || key[1].trim().toLowerCase() !== expected.entity_id.toLowerCase()
        || key[2].trim() !== String(expected.current_year)) return error;
    } else {
      // PostgREST may redact key details. Confirm only the same visible resource after
      // the failed write; never refresh the draft baseline or retry the mutation.
      try {
        const existing = await supabase.from('user_app_state').select('entity_id,current_year')
          .eq('entity_id', expected.entity_id).eq('current_year', expected.current_year).maybeSingle();
        if (existing.error || !existing.data || Array.isArray(existing.data)
          || String(existing.data.entity_id).toLowerCase() !== expected.entity_id.toLowerCase()
          || existing.data.current_year !== expected.current_year) return error;
      } catch {
        return error; // Preserve the original technical cause when confirmation is unavailable.
      }
    }
    return { code: 'STATE_CONCURRENT_CREATION',
      message: 'Questa annualità è stata creata da un’altra sessione. Le modifiche non sono state salvate e sono state conservate. Verifica i dati prima di riprovare.',
      cause: error };
  }
  private confirmWrite(expected: any, result: { data: any; error: any }): StateWriteResult {
    if (result.error) return { error: result.error };
    const actual = result.data;
    const matches = actual && !Array.isArray(actual)
      && ['entity_id', 'current_year', 'user_id', 'email', 'role'].every(key => actual[key] === expected[key])
      && serializeSnapshotPayload(actual.fund_data) === serializeSnapshotPayload(expected.fund_data)
      && isVersion(actual.b1i4_version) && actual.b1i4_version !== expected.b1i4_expected && actual.b1i4_expected === null;
    return matches ? { data: actual, version: actual.b1i4_version, error: null }
      : { error: new StatePersistenceError('STATE_WRITE_NOT_CONFIRMED', 'Salvataggio non confermato. La bozza è stata conservata; verifica dati e autorizzazioni prima di riprovare.') };
  }
  async closeYearAtomic(params: { entityId: string; currentYear: number; closedFundData: any; nextFundData: any; currentVersion?: string; nextVersion?: string | null }): Promise<{ data: any; error: any }> {
    if (!isVersion(params.currentVersion) || params.nextVersion === undefined || (params.nextVersion !== null && !isVersion(params.nextVersion))) {
      return { data: null, error: new StatePersistenceError('STATE_VERSION_REQUIRED', 'Versioni della chiusura non disponibili.') };
    }
    const issues = [...validateMonetaryProcessing(params.closedFundData), ...validateMonetaryProcessing(params.nextFundData)];
    if (issues.length) return { data: null, error: { code: 'MONETARY_VALIDATION_ERROR', message: 'Importi non validi.', issues } };
    try {
      const result = await supabase.rpc('close_annual_snapshot_versioned', {
        p_entity_id: params.entityId, p_current_year: params.currentYear,
        p_current_version: params.currentVersion, p_next_version: params.nextVersion,
        p_closed_fund_data: normalizeMonetaryData(params.closedFundData), p_next_fund_data: normalizeMonetaryData(params.nextFundData)
      });
      if (result.error) return { data: null, error: persistenceError(result.error) };
      const r = result.data; const cur = r?.currentSnapshot; const next = r?.nextSnapshot;
      if (r?.success !== true || !isVersion(r.currentVersion) || !isVersion(r.nextVersion)
        || r.currentVersion === params.currentVersion
        || cur?.entity_id !== params.entityId || cur.current_year !== params.currentYear || cur.b1i4_version !== r.currentVersion
        || cur.fund_data?.metadata?.snapshotStatus !== 'CLOSED'
        || next?.entity_id !== params.entityId || next.current_year !== params.currentYear + 1 || next.b1i4_version !== r.nextVersion) {
        return { data: null, error: new StatePersistenceError('STATE_WRITE_NOT_CONFIRMED', 'La risposta di chiusura non è completa. Verifica l’esito prima di riprovare.') };
      }
      return { data: r, error: null };
    } catch (cause) { return { data: null, error: new StatePersistenceError('STATE_OUTCOME_UNKNOWN', 'Esito della chiusura non disponibile. Verifica prima di riprovare.', cause) }; }
  }
}
