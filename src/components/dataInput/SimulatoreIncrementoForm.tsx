// components/dataInput/SimulatoreIncrementoForm.tsx
import React, { useEffect, useCallback } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { SimulatoreIncrementoInput } from '../../types.ts';
import { TipologiaEnte } from '../../enums.ts';
import { Input } from '../shared/Input.tsx';
import { Card } from '../shared/Card.tsx';
import { TEXTS_UI } from '../../constants.ts';
import { calculateSimulazione } from '../../logic/index.ts';
import { useNormativeData } from '../../hooks/useNormativeData.ts';

import { formatCurrency, formatPercentage } from '../../utils/formatters.ts';
import { Dl25CarryForwardFields } from './Dl25CarryForwardFields';
import type { Dl25AnnualState } from '../../domain/dl25';
import { Dl25FinancialSummary } from './Dl25FinancialSummary';

const formatCurrencyForDisplay = (value?: number) => {
  return formatCurrency(value);
};

const formatPercentageForDisplay = (value?: number) => {
  return formatPercentage(value);
};

export const SimulatoreIncrementoForm: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { validationErrors } = state;
  const { data: normativeData } = useNormativeData();
  const { simulatoreInput, numeroAbitanti, tipologiaEnte, simulatoreRisultati } = state.fundData.annualData;
  const annual = state.fundData.annualData;
  const closed = state.fundData.metadata?.snapshotStatus === 'CLOSED';

  const runAndDispatchSimulazione = useCallback(() => {
    if (closed) return;
    const results = calculateSimulazione(simulatoreInput, numeroAbitanti, tipologiaEnte, annual);
    dispatch({ type: 'UPDATE_SIMULATORE_RISULTATI', payload: results });
  }, [simulatoreInput, numeroAbitanti, tipologiaEnte, annual.dl25, annual.annoRiferimento, annual.entityClassification, annual.art33ManualDecision, closed, dispatch]);

  useEffect(() => {
    runAndDispatchSimulazione();
  }, [runAndDispatchSimulazione]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (closed) return;
    const { name, value } = e.target;
    const processedValue = value === '' ? undefined : parseFloat(value);
    dispatch({ type: 'UPDATE_SIMULATORE_INPUT', payload: { [name]: processedValue } as Partial<SimulatoreIncrementoInput> });
    const baseKeys: Record<string, keyof Dl25AnnualState> = { simStipendiTabellari2023: 'stipendiTabellari2023NonDirigenti', simFondoStabileAnnoApplicazione: 'fondoStabile2025Certificato', simRisorsePOEQAnnoApplicazione: 'budgetEq2025' };
    if (baseKeys[name]) changeFacts({ [baseKeys[name]]: processedValue });
  };
  const facts: Dl25AnnualState = annual.dl25 ?? {
    stipendiTabellari2023NonDirigenti: simulatoreInput?.simStipendiTabellari2023,
    fondoStabile2025Certificato: simulatoreInput?.simFondoStabileAnnoApplicazione,
    budgetEq2025: simulatoreInput?.simRisorsePOEQAnnoApplicazione,
    legacyStoredAmount: state.fundData.fondoAccessorioDipendenteData?.st_incrementoDL25_2025,
  };
  const changeFacts = (updates: Partial<Dl25AnnualState>) => {
    if (!closed) dispatch({ type: 'UPDATE_ANNUAL_DATA', payload: { dl25: { ...facts, ...updates } } });
  };

  const referringNormatives = normativeData?.riferimenti_normativi || {};

  const si = simulatoreInput || {};
  const risultati = simulatoreRisultati;

  const tabellaSoglieUsata = tipologiaEnte === TipologiaEnte.PROVINCIA ? "Province" : "Comuni";

  return (
    <Card title="Simulatore Incremento Potenziale Fondo Salario Accessorio" className="mt-8 mb-8" isCollapsible={true} defaultCollapsed={true}>
      <fieldset disabled={closed}>
      <p className="text-sm text-[#5f5252] mb-4">
        Questo strumento permette di simulare l'incremento potenziale del fondo del salario accessorio basandosi sulle normative (DL 25/2025 per il 48%, DM 17/03/2020 per la sostenibilità, L. 296/06 per il tetto storico).
        L'ente è attualmente identificato come: <strong className="text-[#1b0e0e]">{tipologiaEnte || "Non specificato"}</strong>.
        Il "Numero Abitanti" utilizzato per la fascia DM 17/03/2020 è: <strong className="text-[#1b0e0e]">{numeroAbitanti || TEXTS_UI.notApplicable}</strong>.
        La tabella delle soglie DM 17/03/2020 applicata è quella per: <strong className="text-[#1b0e0e]">{tabellaSoglieUsata}</strong>.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <Input monetaryPath="stipendiTabellari2023NonDirigenti"
            label="Stipendi tabellari personale 2023"
            type="number"
            name="simStipendiTabellari2023"
            value={facts.stipendiTabellari2023NonDirigenti ?? ''}
            onChange={handleChange}
            step="0.01"
            placeholder="Es. 1500000.00"
            containerClassName="mb-1"
            error={validationErrors['fundData.annualData.simulatoreInput.simStipendiTabellari2023']}
          />
          <p className="text-xs text-[#5f5252] px-1">Come da Circ. RGS 175706/2025: valore complessivo lordo dipendente, inclusa 13a mensilità. Escludere l'Indennità di Vacanza Contrattuale (IVC).</p>
        </div>
        <div>
          <Input monetaryPath="fondoStabile2025Certificato"
            label="Componente stabile certificata 2025, prima dell’incremento DL25:"
            type="number"
            name="simFondoStabileAnnoApplicazione"
            value={facts.fondoStabile2025Certificato ?? ''}
            onChange={handleChange}
            step="0.01"
            placeholder="Es. 200000.00"
            containerClassName="mb-1"
            error={validationErrors['fundData.annualData.simulatoreInput.simFondoStabileAnnoApplicazione']}
          />
          <p className="text-xs text-[#5f5252] px-1">Baseline amministrativa fissa 2025 ante DL25, distinta dal Fondo corrente che già incorpora lo stock cumulativo (MEF §2.3.a).</p>
        </div>
        <div>
          <Input monetaryPath="budgetEq2025"
            label="Remunerazione incarichi Elevata Qualificazione (EQ) 2025:"
            type="number"
            name="simRisorsePOEQAnnoApplicazione"
            value={facts.budgetEq2025 ?? ''}
            onChange={handleChange}
            step="0.01"
            placeholder="Es. 50000.00"
            containerClassName="mb-1"
            error={validationErrors['fundData.annualData.simulatoreInput.simRisorsePOEQAnnoApplicazione']}
          />
          <p className="text-xs text-[#5f5252] px-1">Importo EQ della baseline amministrativa 2025 (MEF §2.3.b).</p>
        </div>
        <div>
          <Input monetaryPath="simSpesaPersonaleConsuntivo2023"
            label="Spesa di personale (ultimo consuntivo approvato, €)"
            type="number"
            name="simSpesaPersonaleConsuntivo2023"
            value={si.simSpesaPersonaleConsuntivo2023 ?? ''}
            onChange={handleChange}
            step="0.01"
            placeholder="Es. 2000000.00"
            containerClassName="mb-1"
            error={validationErrors['fundData.annualData.simulatoreInput.simSpesaPersonaleConsuntivo2023']}
          />
          <p className="text-xs text-[#5f5252] px-1">Spesa risultante dal macroaggregato BDAP U.1.01.00.00.000, nonché nei codici spesa: U1.03.02.12.001; U1.03.02.12.002; U1.03.02.12.003; U1.03.02.12.999</p>
        </div>
        <div>
          <Input monetaryPath="simMediaEntrateCorrenti2021_2023"
            label="Media Entrate Correnti 2021-23 (netto FCDE 2023, €)"
            type="number"
            name="simMediaEntrateCorrenti2021_2023"
            value={si.simMediaEntrateCorrenti2021_2023 ?? ''}
            onChange={handleChange}
            step="0.01"
            placeholder="Es. 8000000.00"
            containerClassName="mb-3"
            error={validationErrors['fundData.annualData.simulatoreInput.simMediaEntrateCorrenti2021_2023']}
          />
        </div>
        <div>
          <Input monetaryPath="simTettoSpesaPersonaleL296_06"
            label="Tetto di spesa personale art. 1 c. 557 o c. 562 L. 296/06 (media 2011-13 o 2008):"
            type="number"
            name="simTettoSpesaPersonaleL296_06"
            value={si.simTettoSpesaPersonaleL296_06 ?? ''}
            onChange={handleChange}
            step="0.01"
            placeholder="Es. 1800000.00"
            containerClassName="mb-1"
            error={validationErrors['fundData.annualData.simulatoreInput.simTettoSpesaPersonaleL296_06']}
          />
          <p className="text-xs text-[#5f5252] px-1">Spesa di personale complessiva, al netto delle voci sterilizzate per il calcolo</p>
        </div>
        <div>
          <Input monetaryPath="simCostoAnnuoNuoveAssunzioniPIAO"
            label="Costo annuo nuove assunzioni PIAO (a regime, €)"
            type="number"
            name="simCostoAnnuoNuoveAssunzioniPIAO"
            value={si.simCostoAnnuoNuoveAssunzioniPIAO ?? ''}
            onChange={handleChange}
            step="0.01"
            placeholder="Es. 70000.00"
            containerClassName="mb-3"
            error={validationErrors['fundData.annualData.simulatoreInput.simCostoAnnuoNuoveAssunzioniPIAO']}
          />
        </div>
        <div>
          <Input
            label="Percentuale oneri riflessi al netto dell'IRAP e maggiorato con i contributi INAIL sull'incremento del fondo:"
            type="number"
            name="simPercentualeOneriIncremento"
            value={si.simPercentualeOneriIncremento ?? ''}
            onChange={handleChange}
            step="0.01"
            placeholder="Es. 27.40"
            containerClassName="mb-1"
            error={validationErrors['fundData.annualData.simulatoreInput.simPercentualeOneriIncremento']}
          />
          <p className="text-xs text-[#5f5252] px-1">La Circ. RGS indica convenzionalmente il 27,4% + INAIL.</p>
        </div>
      </div>

      <fieldset disabled={closed}><Dl25CarryForwardFields facts={facts} referenceYear={annual.annoRiferimento} onChange={changeFacts} /></fieldset>
      <Dl25FinancialSummary result={risultati} />
      {risultati && (
        <div className="mt-6 space-y-4">
          <p role="status">{risultati.state === 'VALID' ? 'Massimo netto simulato, subordinato alla verifica dei requisiti.' : 'Incremento da determinare: completare dati, stock precedente e data business.'}</p>
          <p>Regime L296: {risultati.regime === 'L296_DISAPPLIED' ? 'Disapplicato per ente soggetto ad Art33' : risultati.regime === 'HISTORICAL' ? 'Storico applicabile' : 'Da determinare'}.
            {risultati.dateIndifferent && ' Il risultato è identico nei due regimi: L296 non è vincolante.'}</p>
          <PhaseCard title={`Fase 1: Incremento Potenziale Massimo (Target 48% - ${referringNormatives.art14_dl25_2025 || 'Art. 14 DL 25/2025'})`} highlightValue={formatCurrencyForDisplay(risultati.fase1_incrementoPotenzialeLordo) + " (Limite 1)"}>
            <p>Obiettivo 48% degli stipendi tabellari 2023: {formatCurrencyForDisplay(risultati.fase1_obiettivo48)}</p>
            <p>Baseline 2025 ante DL25 (Stabile + EQ + rettifiche): {formatCurrencyForDisplay(risultati.fase1_fondoAttualeComplessivo)}</p>
            <p>Margine netto residuo del plafond complessivo 48%: {formatCurrencyForDisplay(risultati.fase1_incrementoPotenzialeNetto)}</p>
          </PhaseCard>

          <PhaseCard title={`Fase 2: Verifica Limite Spesa Personale (${referringNormatives.dm_17_03_2020 || 'DM 17/03/2020'} - Tabella ${tabellaSoglieUsata})`} highlightValue={formatCurrencyForDisplay(risultati.fase2_spazioDisponibileDL34) + " (Limite 2)"}>
            <p>Spesa di Personale Futura Prevista (Consuntivo 2023 + Assunzioni PIAO): {formatCurrencyForDisplay(risultati.fase2_spesaPersonaleAttualePrevista)}</p>
            <p>Soglia % Spesa Personale / Entrate Correnti (per {numeroAbitanti || 'N/D'} abitanti - Tab. {tabellaSoglieUsata}): {formatPercentageForDisplay(risultati.fase2_sogliaPercentualeDM17_03_2020)}</p>
            <p>Limite di Spesa Sostenibile (Entrate Correnti * Soglia %): {formatCurrencyForDisplay(risultati.fase2_limiteSostenibileDL34)}</p>
            <p>Spazio Disponibile rispetto al Limite Sostenibile: {formatCurrencyForDisplay(risultati.fase2_spazioDisponibileDL34)}</p>
          </PhaseCard>

          <PhaseCard title={`Fase 3: Verifica Limite Tetto Storico (${referringNormatives.l296_06_c557 || 'Art. 1 c. 557 L. 296/06'})`} highlightValue={risultati.regime === 'L296_DISAPPLIED' ? 'Non applicabile' : formatCurrencyForDisplay(risultati.fase3_margineDisponibileL296_06) + " (Limite 3)"}>
            <p>Tetto di Spesa Personale (Art. 1 c.557 L. 296/06): {formatCurrencyForDisplay(si.simTettoSpesaPersonaleL296_06)}</p>
            <p>Spesa di Personale Futura Prevista: {formatCurrencyForDisplay(risultati.fase2_spesaPersonaleAttualePrevista)}</p>
            <p>Margine Disponibile rispetto al Tetto Storico: {risultati.regime === 'L296_DISAPPLIED' ? 'Non applicabile' : formatCurrencyForDisplay(risultati.fase3_margineDisponibileL296_06)}</p>
          </PhaseCard>

          <PhaseCard title="Fase 4: Spazio Utilizzabile Netto" highlightValue={formatCurrencyForDisplay(risultati.fase4_spazioUtilizzabileNetto)}>
            <p>Il minimo confronta margini netti omogenei. Solo gli spazi finanziari lordi vengono convertiti prima del confronto; L296 partecipa soltanto nel regime applicabile.</p>
            <ul className="list-disc list-inside text-sm ml-4">
              <li>Limite 1 (Target 48%): {formatCurrencyForDisplay(risultati.fase1_incrementoPotenzialeLordo)}</li>
              <li>Limite 2 netto (Sostenibilità): {formatCurrencyForDisplay(risultati.fase2_spazioDisponibileNetto)}</li>
              <li>Limite 3 netto (L296): {risultati.regime === 'L296_DISAPPLIED' ? 'Non applicabile' : formatCurrencyForDisplay(risultati.fase3_margineDisponibileNetto)}</li>
            </ul>
          </PhaseCard>

          <PhaseCard title="Fase 5: Calcolo Incremento Netto Effettivo del Fondo" isFinalResult={true} highlightValue={formatCurrencyForDisplay(risultati.fase5_incrementoNettoEffettivoFondo)}>
            <p>Spazio Utilizzabile Lordo (dalla Fase 4): {formatCurrencyForDisplay(risultati.fase4_spazioUtilizzabileLordo)}</p>
            <p>Oneri riflessi al netto IRAP e comprensivi INAIL: {formatPercentageForDisplay(si.simPercentualeOneriIncremento)}</p>
            <p className="font-semibold text-[#1b0e0e]">Massimo finanziario simulato. La decisione facoltativa richiede la verifica Art33 e l’equilibrio pluriennale asseverato; non applica automaticamente il margine al Fondo.</p>
          </PhaseCard>
        </div>
      )}
      </fieldset>
    </Card>
  );
};

interface PhaseCardProps {
  title: string;
  children: React.ReactNode;
  highlightValue: string;
  isFinalResult?: boolean;
}

const PhaseCard: React.FC<PhaseCardProps> = ({ title, children, highlightValue, isFinalResult = false }) => {
  return (
    <div className={`p-4 border rounded-lg shadow-sm ${isFinalResult ? 'bg-[#f0fff4] border-[#c6f6d5]' : 'bg-[#f0f9ff] border-[#e0f2fe]'}`}>
      <h5 className={`text-md font-bold mb-2 ${isFinalResult ? 'text-[#2f855a]' : 'text-[#2b6cb0]'}`}>{title}</h5>
      <div className="text-sm text-[#1b0e0e] space-y-1 mb-3">{children}</div>
      <div className={`mt-2 pt-2 border-t ${isFinalResult ? 'border-green-200' : 'border-sky-200'}`}>
        <p className={`text-sm font-medium ${isFinalResult ? 'text-[#2f855a]' : 'text-[#2b6cb0]'}`}>
          Risultato Fase: <strong className={`text-lg font-bold ${isFinalResult ? 'text-[#ea2832]' : 'text-[#ea2832]'}`}>{highlightValue}</strong>
        </p>
      </div>
    </div>
  );
};
