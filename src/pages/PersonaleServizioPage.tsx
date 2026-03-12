// pages/PersonaleServizioPage.tsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { PersonaleServizioDettaglio, TipoMaggiorazione, AreaQualifica } from '../types';
import { Card } from '../components/shared/Card';
import { Input } from '../components/shared/Input';
import { Select } from '../components/shared/Select';
import { Button } from '../components/shared/Button';
import { TEXTS_UI, ALL_AREE_QUALIFICA, ALL_TIPI_MAGGIORAZIONE } from '../constants';
import { useNormativeData } from '../hooks/useNormativeData';

const NESSUNA_PEO_VALUE = ""; // Sentinel value for "Nessuna PEO"

import { formatCurrency } from '../utils/formatters.ts';
import { calculateAbsorbedProgression, calculateAbsorbedIndennitaComparto, calculateTotalDipendentiEquivalenti } from '../logic/personaleCalculations';

const getPeoOptionsForArea = (area?: AreaQualifica, progressionEconomicValues?: any): { value: string; label: string }[] => {
  const baseOptions = [{ value: NESSUNA_PEO_VALUE, label: "Nessuna PEO" }];
  if (!area || !progressionEconomicValues) return baseOptions;
  const peoKeys = Object.keys(progressionEconomicValues[area] || {});
  return [...baseOptions, ...peoKeys.map(p => ({ value: p, label: p }))];
};

const getDifferenzialiOptionsForArea = (area?: AreaQualifica): { value: number; label: string }[] => {
  let maxDifferenziali = 6;
  if (area === AreaQualifica.OPERATORE || area === AreaQualifica.OPERATORE_ESPERTO || area === AreaQualifica.ISTRUTTORE) {
    maxDifferenziali = 5;
  }
  return Array.from({ length: maxDifferenziali + 1 }, (_, i) => ({ value: i, label: i.toString() }));
};

const getMaggiorazioniOptionsForArea = (area?: AreaQualifica): { value: string; label: string }[] => {
  if (!area || area === AreaQualifica.OPERATORE || area === AreaQualifica.OPERATORE_ESPERTO) {
    return ALL_TIPI_MAGGIORAZIONE.filter(m => m.value === TipoMaggiorazione.NESSUNA);
  }
  if (area === AreaQualifica.ISTRUTTORE) {
    return ALL_TIPI_MAGGIORAZIONE.filter(m =>
      m.value === TipoMaggiorazione.NESSUNA ||
      m.value === TipoMaggiorazione.EDUCATORE ||
      m.value === TipoMaggiorazione.POLIZIA_LOCALE ||
      m.value === TipoMaggiorazione.ISCRITTO_ALBI_ORDINI
    );
  }
  if (area === AreaQualifica.FUNZIONARIO_EQ) {
    return ALL_TIPI_MAGGIORAZIONE.filter(m =>
      m.value === TipoMaggiorazione.NESSUNA ||
      m.value === TipoMaggiorazione.ISCRITTO_ALBI_ORDINI
    );
  }
  return ALL_TIPI_MAGGIORAZIONE;
};

export const PersonaleServizioPage: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { data: normativeData } = useNormativeData();
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [employeeIdToDelete, setEmployeeIdToDelete] = useState<string | null>(null);

  const { dettagli: employees, isManualMode, manualProgressioni, manualIndennita, manualDipendentiEquivalenti } = state.fundData.personaleServizio;
  const { personaleAnnoRifPerArt23: art23SourceEmployees, annoRiferimento } = state.fundData.annualData;
  const employeeList = employees || [];

  const handleOpenConfirmModal = useCallback((id: string) => {
    setEmployeeIdToDelete(id);
    setConfirmModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    if (employeeIdToDelete) {
      dispatch({ type: 'REMOVE_PERSONALE_SERVIZIO_DETTAGLIO', payload: { id: employeeIdToDelete } });
    }
    setConfirmModalOpen(false);
    setEmployeeIdToDelete(null);
  }, [dispatch, employeeIdToDelete]);

  const handleCancelDelete = useCallback(() => {
    setConfirmModalOpen(false);
    setEmployeeIdToDelete(null);
  }, []);

  const handleSyncFromArt23 = useCallback(() => {
    const sourceList = art23SourceEmployees || [];

    if (sourceList.length === 0) {
      alert("Nessun dato del personale trovato nella sezione Art. 23. Inserire i dati lì prima di sincronizzare.");
      return;
    }

    if (employeeList.length > 0 && !window.confirm("Questa operazione sovrascriverà l'elenco corrente con i dati del calcolo Art. 23. Continuare?")) {
      return;
    }

    const newTargetList: PersonaleServizioDettaglio[] = sourceList.map(sourceEmp => {
      const isFullYear = (sourceEmp.cedoliniEmessi === undefined || sourceEmp.cedoliniEmessi >= 12);
      return {
        id: crypto.randomUUID(),
        partTimePercentage: sourceEmp.partTimePercentage,
        fullYearService: isFullYear,
        assunzioneDate: undefined,
        cessazioneDate: undefined,
        livelloPeoStoriche: undefined,
        numeroDifferenziali: 0,
        tipoMaggiorazione: TipoMaggiorazione.NESSUNA,
        areaQualifica: undefined,
      };
    });

    dispatch({ type: 'SET_PERSONALE_SERVIZIO_DETTAGLI', payload: newTargetList });
    alert("Sincronizzazione completata con successo!");
  }, [dispatch, art23SourceEmployees, employeeList]);

  const handleUpdateEmployee = useCallback((id: string, field: keyof PersonaleServizioDettaglio, value: any) => {
    const changes: Partial<PersonaleServizioDettaglio> = { [field]: value };
    dispatch({ type: 'UPDATE_PERSONALE_SERVIZIO_DETTAGLIO', payload: { id, changes } });
  }, [dispatch]);

  const handleAddEmployee = useCallback(() => {
    const newEmployee: PersonaleServizioDettaglio = {
      id: crypto.randomUUID(),
      fullYearService: true,
      partTimePercentage: 100,
      numeroDifferenziali: 0,
      tipoMaggiorazione: TipoMaggiorazione.NESSUNA,
      livelloPeoStoriche: undefined,
    };
    dispatch({ type: 'ADD_PERSONALE_SERVIZIO_DETTAGLIO', payload: newEmployee });
  }, [dispatch]);

  const handleToggleManualMode = useCallback((enabled: boolean) => {
    dispatch({
      type: 'UPDATE_PERSONALE_SERVIZIO_MANUAL_MODE',
      payload: { isManualMode: enabled }
    });
  }, [dispatch]);

  const handleUpdateManualField = useCallback((field: 'manualProgressioni' | 'manualIndennita' | 'manualDipendentiEquivalenti', value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    dispatch({
      type: 'UPDATE_PERSONALE_SERVIZIO_MANUAL_MODE',
      payload: { isManualMode: true, [field]: numValue }
    });
  }, [dispatch]);

  const totalAbsorbedProgression = useMemo(() => {
    if (!normativeData) return 0;
    return calculateAbsorbedProgression(employeeList, annoRiferimento, normativeData as any);
  }, [employeeList, annoRiferimento, normativeData]);

  const totalAbsorbedIndennitaComparto = useMemo(() => {
    if (!normativeData) return 0;
    return calculateAbsorbedIndennitaComparto(employeeList, annoRiferimento, normativeData as any);
  }, [employeeList, annoRiferimento, normativeData]);

  const totalDipendentiEquivalenti = useMemo(() => {
    return calculateTotalDipendentiEquivalenti(employeeList, annoRiferimento);
  }, [employeeList, annoRiferimento]);

  useEffect(() => {
    const usedProg = isManualMode ? (manualProgressioni || 0) : totalAbsorbedProgression;
    const usedInd = isManualMode ? (manualIndennita || 0) : totalAbsorbedIndennitaComparto;

    dispatch({
      type: 'UPDATE_DISTRIBUZIONE_RISORSE_DATA',
      payload: {
        u_diffProgressioniStoriche: usedProg,
        u_indennitaComparto: usedInd,
      }
    });
  }, [isManualMode, manualProgressioni, manualIndennita, totalAbsorbedProgression, totalAbsorbedIndennitaComparto, dispatch]);

  const displayProgression = isManualMode ? (manualProgressioni || 0) : totalAbsorbedProgression;
  const displayIndennita = isManualMode ? (manualIndennita || 0) : totalAbsorbedIndennitaComparto;
  const totalAbsorbed = displayProgression + displayIndennita;

  if (!normativeData) return <div>Caricamento...</div>;

  return (
    <div className="space-y-8 pb-24"> {/* Added padding-bottom to avoid overlap with sticky bar */}
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">
        Personale in servizio nel {annoRiferimento}
      </h2>

      <Card title="Modalità di Inserimento">
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-[#fef2f2] rounded-lg border border-[#fecaca]">
            <input
              type="checkbox"
              id="manualModeToggle"
              checked={isManualMode}
              onChange={(e) => handleToggleManualMode(e.target.checked)}
              className="h-5 w-5 text-[#ea2832] border-[#d1c0c1] rounded focus:ring-[#ea2832]/50"
            />
            <div className="ml-3">
              <label htmlFor="manualModeToggle" className="text-sm font-bold text-[#1b0e0e]">
                Abilita Inserimento Manuale Risorse
              </label>
              <p className="text-xs text-[#5f5252]">
                Se abilitato, potrai inserire manualmente i totali per indennità e progressioni, sovrascrivendo i calcoli automatici basati sull'elenco dipendenti.
              </p>
            </div>
          </div>

          {isManualMode && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <Input
                label="Totale Progressioni Economiche Assorbite (€)"
                type="number"
                id="manualProgressioni"
                value={manualProgressioni ?? ''}
                onChange={(e) => handleUpdateManualField('manualProgressioni', e.target.value)}
                placeholder="Inserisci totale progressioni..."
              />
              <Input
                label="Totale Indennità di Comparto Assorbita (€)"
                type="number"
                id="manualIndennita"
                value={manualIndennita ?? ''}
                onChange={(e) => handleUpdateManualField('manualIndennita', e.target.value)}
                placeholder="Inserisci totale indennità..."
              />
              <div className="md:col-span-2 p-3 bg-white rounded border border-[#f3e7e8]">
                <Input
                  label={`Personale Equivalente Anno ${annoRiferimento} (FTE)`}
                  type="number"
                  id="manualDipendentiEquivalenti"
                  value={manualDipendentiEquivalenti ?? ''}
                  onChange={(e) => handleUpdateManualField('manualDipendentiEquivalenti', e.target.value)}
                  placeholder="Inserisci personale equivalente..."
                  step="0.01"
                />
                <p className="mt-2 text-[11px] text-[#5f5252] italic leading-tight">
                  <strong>Nota sul calcolo:</strong> Il personale va calcolato per testa, rapportato al part-time ed al numero di cedolini erogati nell'anno.
                  Esempio: un dipendente part-time al 70% (0,7) che ha lavorato 8 mesi vale: (1 * 0,7) / 12 * 8 = <strong>0,47</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card title={`Elenco Personale Dipendente Anno ${annoRiferimento}`} className={isManualMode ? "opacity-60 pointer-events-none" : ""}>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4 p-3 bg-[#f3e7e8] rounded-lg">
          <p className="text-sm text-[#5f5252] flex-1 min-w-[200px]">
            {isManualMode
              ? "L'elenco dipendenti è disabilitato in modalità manuale."
              : "Gestisci l'elenco dei dipendenti per l'anno di riferimento. Puoi partire sincronizzando i dati dal calcolo Art. 23."
            }
          </p>
          {!isManualMode && (
            <Button variant="secondary" onClick={handleSyncFromArt23}>
              Sincronizza con dati Art. 23
            </Button>
          )}
        </div>

        {employeeList.map((employee, index) => {
          const peoOptions = getPeoOptionsForArea(employee.areaQualifica, normativeData.progression_economic_values);
          const differenzialiOptions = getDifferenzialiOptionsForArea(employee.areaQualifica);
          const maggiorazioniOptions = getMaggiorazioniOptionsForArea(employee.areaQualifica);
          const isMaggiorazioneDisabled = employee.areaQualifica === AreaQualifica.OPERATORE || employee.areaQualifica === AreaQualifica.OPERATORE_ESPERTO;

          return (
            <Card
              key={employee.id}
              title={`Dipendente ${index + 1}`}
              className="mb-6 bg-white"
              isCollapsible
              defaultCollapsed={employeeList.length > 1} // Collapse if more than 1 employee
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-0">
                <Select
                  label="Area/Qualifica"
                  id={`area_qualifica_${employee.id}`}
                  options={ALL_AREE_QUALIFICA}
                  value={employee.areaQualifica ?? ''}
                  onChange={(e) => handleUpdateEmployee(employee.id, 'areaQualifica', e.target.value)}
                  placeholder="Seleziona area..."
                  containerClassName="mb-3"
                />
                <Input
                  label="% Part-Time"
                  type="number"
                  id={`pt_${employee.id}`}
                  value={employee.partTimePercentage ?? ''}
                  onChange={(e) => handleUpdateEmployee(employee.id, 'partTimePercentage', e.target.value)}
                  min="1" max="100" step="0.01" placeholder="100"
                  containerClassName="mb-3"
                />
                <div className="flex items-center col-span-full md:col-span-1 mb-3 mt-2 md:mt-8">
                  <input
                    type="checkbox"
                    id={`fullYear_${employee.id}`}
                    checked={employee.fullYearService}
                    onChange={(e) => handleUpdateEmployee(employee.id, 'fullYearService', e.target.checked)}
                    className="h-5 w-5 text-[#ea2832] border-[#d1c0c1] rounded focus:ring-[#ea2832]/50"
                  />
                  <label htmlFor={`fullYear_${employee.id}`} className="ml-2 text-sm text-[#1b0e0e]">
                    In servizio tutto l'anno?
                  </label>
                </div>

                {!employee.fullYearService && (
                  <>
                    <Input
                      label="Data Assunzione"
                      type="date"
                      id={`assunzione_${employee.id}`}
                      value={employee.assunzioneDate ?? ''}
                      onChange={(e) => handleUpdateEmployee(employee.id, 'assunzioneDate', e.target.value)}
                      containerClassName="mb-3"
                    />
                    <Input
                      label="Data Cessazione"
                      type="date"
                      id={`cessazione_${employee.id}`}
                      value={employee.cessazioneDate ?? ''}
                      onChange={(e) => handleUpdateEmployee(employee.id, 'cessazioneDate', e.target.value)}
                      containerClassName="mb-3"
                    />
                  </>
                )}

                <Select
                  label="Livello PEO Storiche"
                  id={`livelloPeo_${employee.id}`}
                  options={peoOptions}
                  value={employee.livelloPeoStoriche ?? NESSUNA_PEO_VALUE}
                  onChange={(e) => handleUpdateEmployee(employee.id, 'livelloPeoStoriche', e.target.value)}
                  placeholder="Seleziona livello..."
                  containerClassName="mb-3 col-span-full sm:col-span-1"
                  disabled={!employee.areaQualifica}
                />
                <Select
                  label="Numero Differenziali"
                  id={`numDiff_${employee.id}`}
                  options={differenzialiOptions}
                  value={employee.numeroDifferenziali ?? '0'}
                  onChange={(e) => handleUpdateEmployee(employee.id, 'numeroDifferenziali', e.target.value)}
                  placeholder="Seleziona n° diff..."
                  containerClassName="mb-3 col-span-full sm:col-span-1"
                  disabled={!employee.areaQualifica}
                />
                <Select
                  label="Tipo Maggiorazione Specifiche"
                  id={`maggiorazione_${employee.id}`}
                  options={maggiorazioniOptions}
                  value={employee.tipoMaggiorazione ?? TipoMaggiorazione.NESSUNA}
                  onChange={(e) => handleUpdateEmployee(employee.id, 'tipoMaggiorazione', e.target.value)}
                  placeholder="Seleziona maggiorazione..."
                  containerClassName="mb-3 col-span-full sm:col-span-1"
                  disabled={!employee.areaQualifica || isMaggiorazioneDisabled}
                />
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="danger" size="sm" onClick={() => handleOpenConfirmModal(employee.id)}>
                  {TEXTS_UI.remove} Dipendente
                </Button>
              </div>
            </Card>
          );
        })}

        <div className="mt-6">
          <Button variant="primary" onClick={handleAddEmployee}>
            {TEXTS_UI.add} Dipendente
          </Button>
        </div>
      </Card>

      <Card title="Riepilogo Risorse Assorbite" className="mt-8">
        <div className="space-y-4 p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#5f5252]">Progressioni Economiche Assorbite</span>
            <span className="font-semibold text-[#1b0e0e]">{formatCurrency(displayProgression)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-[#5f5252]">Indennità di Comparto Assorbita</span>
            <span className="font-semibold text-[#1b0e0e]">{formatCurrency(displayIndennita)}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-[#5f5252]">Personale Equivalente (FTE) {isManualMode ? "(Manuale)" : "(Calcolato)"}</span>
            <span className="font-semibold text-[#1b0e0e]">{isManualMode ? (manualDipendentiEquivalenti || 0) : totalDipendentiEquivalenti.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t border-[#f3e7e8]">
            <span className="font-bold text-[#1b0e0e]">TOTALE RISORSE ASSORBITE</span>
            <span className="text-xl font-bold text-[#ea2832]">{formatCurrency(totalAbsorbed)}</span>
          </div>
        </div>
      </Card>

      {isConfirmModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
          aria-labelledby="confirm-modal-title"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 id="confirm-modal-title" className="text-lg font-bold text-[#1b0e0e]">Conferma Eliminazione</h3>
            <p className="mt-2 text-sm text-[#5f5252]">
              Sei sicuro di voler eliminare definitivamente questo dipendente? L'azione non può essere annullata.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="secondary" onClick={handleCancelDelete}>
                Annulla
              </Button>
              <Button variant="danger" onClick={handleConfirmDelete}>
                Conferma Eliminazione
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};