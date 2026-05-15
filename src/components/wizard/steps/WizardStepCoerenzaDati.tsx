import React, { useMemo } from 'react';
import { FundData } from '../../../domain/types';
import { WizardValidationPanel, ValidationItem } from '../shared/WizardValidationPanel';
import { calculateSimulazione } from '../../../logic/calculation/fundEngine';
import { calculateCcnl2024Increases } from '../../../logic/ccnl2024Calculations';
import { Info } from 'lucide-react';

interface WizardStepCoerenzaDatiProps {
  data: FundData;
}

export const WizardStepCoerenzaDati: React.FC<WizardStepCoerenzaDatiProps> = ({ data }) => {
    
    const validations = useMemo(() => {
        const { annualData, historicalData, fondoAccessorioDipendenteData } = data;
        
        const generalChecks: ValidationItem[] = [];
        const storiciChecks: ValidationItem[] = [];
        const dL25Checks: ValidationItem[] = [];
        const ccnlChecks: ValidationItem[] = [];

        // --- Generali ---
        if (!annualData.denominazioneEnte || !annualData.annoRiferimento) {
            generalChecks.push({ id: 'gen-1', title: 'Anagrafica Incompleta', description: 'Mancano denominazione o anno di riferimento.', status: 'error' });
        } else {
            generalChecks.push({ id: 'gen-1', title: 'Anagrafica Base OK', description: 'Denominazione e anno presenti.', status: 'success' });
        }

        if (!annualData.tipologiaEnte) {
            generalChecks.push({ id: 'gen-2', title: 'Tipologia Ente', description: 'Tipologia ente non specificata.', status: 'error' });
        } else {
            generalChecks.push({ id: 'gen-2', title: 'Tipologia Ente OK', description: 'Tipologia e abitanti coerenti.', status: 'success' });
        }

        // --- Dati Storici ---
        if (!historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 && !historicalData.manualPersonalFundLimit2016) {
            storiciChecks.push({ id: 'st-1', title: 'Limite 2016 Mancante', description: 'Nessun dato storico 2016 o limite manuale inserito. Questo è fondamentale per il calcolo del limite ex Art. 23.', status: 'error' });
        } else {
            storiciChecks.push({ id: 'st-1', title: 'Limite 2016 Presente', description: 'I dati storici per il limite 2016 sono valorizzati.', status: 'success' });
        }

        if (!historicalData.personaleServizio2018 && !annualData.manualDipendentiEquivalenti2018) {
            storiciChecks.push({ id: 'st-2', title: 'Dati 2018 Mancanti', description: 'FTE o dati storici 2018 mancanti. Impossibile calcolare il riproporzionamento Art. 33.', status: 'error' });
        } else {
            storiciChecks.push({ id: 'st-2', title: 'Dati Storici 2018 Presenti', description: 'FTE 2018 valorizzato.', status: 'success' });
        }

        const currentFTE = annualData.personaleServizioAttuale.reduce((acc, curr) => acc + (curr.count || 0), 0);
        const fte2018 = annualData.manualDipendentiEquivalenti2018 || historicalData.personaleServizio2018 || 0;
        if (fte2018 > 0 && currentFTE > 0) {
            const diff = Math.abs((currentFTE - fte2018) / fte2018);
            if (diff > 0.3) {
                storiciChecks.push({ id: 'st-3', title: 'FTE 2018 vs Attuale', description: `Differenza rilevante (>30%) tra personale 2018 (${fte2018}) e attuale (${currentFTE}). Verificare i dati.`, status: 'warning' });
            } else {
                storiciChecks.push({ id: 'st-3', title: 'FTE 2018 vs Attuale', description: 'Rapporto personale storico/attuale coerente.', status: 'success' });
            }
        }

        // --- DL 25/2025 ---
        const monteSalari = annualData.ccnl2024?.monteSalari2021 || 0;
        const incremento014 = fondoAccessorioDipendenteData.st_incrementoDL25_2025 || 0;
        if (monteSalari > 0 && incremento014 === 0) {
            dL25Checks.push({ id: 'dl-1', title: 'Incremento 0,14%', description: 'Monte Salari 2021 presente, ma incremento D.L. 25 non valorizzato.', status: 'warning' });
        } else if (incremento014 > 0) {
            dL25Checks.push({ id: 'dl-1', title: 'Incremento 0,14%', description: 'Incremento 0,14% regolarmente valorizzato.', status: 'success' });
        } else {
            dL25Checks.push({ id: 'dl-1', title: 'D.L. 25/2025 Opzionale', description: 'Incremento D.L. 25 non applicato.', status: 'info' });
        }

        try {
            const simRes = calculateSimulazione(annualData.simulatoreInput, annualData.numeroAbitanti, annualData.tipologiaEnte);
            if (simRes && simRes.fase1_obiettivo48 && simRes.fase1_obiettivo48 <= 48) {
                dL25Checks.push({ id: 'dl-2', title: 'Sostenibilità 48%', description: `Rapporto fondo/stipendi (${simRes.fase1_obiettivo48.toFixed(2)}%) entro il limite del 48%.`, status: 'success' });
            } else if (simRes && simRes.fase1_obiettivo48 && simRes.fase1_obiettivo48 > 48) {
                dL25Checks.push({ id: 'dl-2', title: 'Sostenibilità 48%', description: `Rapporto (${simRes.fase1_obiettivo48.toFixed(2)}%) supera il tetto del 48%.`, status: 'warning' });
            } else {
                dL25Checks.push({ id: 'dl-2', title: 'Sostenibilità 48%', description: 'Dati insufficienti per valutare il tetto del 48%.', status: 'info' });
            }
        } catch (e) {
            dL25Checks.push({ id: 'dl-2', title: 'Sostenibilità 48%', description: 'Dati simulatore mancanti o incompleti.', status: 'info' });
        }

        // --- CCNL 2026 ---
        const ccnlRes = calculateCcnl2024Increases(annualData.ccnl2024 || {});
        if (ccnlRes.riduzioneConglobamento > 0) {
            ccnlChecks.push({ id: 'cc-1', title: 'Conglobamento Art. 60', description: 'Riduzione stabile calcolata correttamente (12 mensilità su base FTE comparto).', status: 'success' });
        } else {
            ccnlChecks.push({ id: 'cc-1', title: 'Conglobamento Art. 60', description: 'Nessuna riduzione per conglobamento calcolata.', status: 'warning' });
        }

        if (annualData.ccnl2024?.optionalIncreaseVariableFrom2026Percentage || annualData.ccnl2024?.optionalIncreaseVariable2026OnlyPercentage) {
            ccnlChecks.push({ id: 'cc-2', title: 'Incrementi Variabili 0,22%', description: 'Quote percentuali opzionali inserite.', status: 'success' });
        } else {
            ccnlChecks.push({ id: 'cc-2', title: 'Incrementi Variabili 0,22%', description: 'Nessun incremento opzionale previsto.', status: 'info' });
        }

        ccnlChecks.push({ id: 'cc-3', title: 'Indennità di Comparto', description: 'Promemoria: l\'utilizzo dell\'indennità al personale è indipendente dalla riduzione stabile del fondo ed è gestito nella Vista Tecnica (Distribuzione).', status: 'info' });

        return { generalChecks, storiciChecks, dL25Checks, ccnlChecks };

    }, [data]);

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                <div className="flex gap-3">
                    <Info className="text-orange-600 shrink-0" size={20} />
                    <div className="text-sm text-orange-800">
                        <p className="font-bold mb-1">Pre-flight Check: Coerenza Dati</p>
                        <p>
                            Questo step verifica la coerenza formale dei dati inseriti finora, esclusivamente in modalità simulativa.
                            I warning (<span className="text-amber-600 font-bold">⚠️</span>) e le info (<span className="text-blue-600 font-bold">ℹ️</span>) non bloccano il salvataggio.
                            Eventuali errori (<span className="text-red-600 font-bold">❌</span>) indicano l'assenza di dati minimi necessari per la corretta costituzione del fondo.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <WizardValidationPanel title="Identificazione & Dati Base" items={validations.generalChecks} />
                <WizardValidationPanel title="Dati Storici (Art. 23)" items={validations.storiciChecks} />
                <WizardValidationPanel title="Parametri D.L. 25/2025" items={validations.dL25Checks} />
                <WizardValidationPanel title="Parametri CCNL 2026" items={validations.ccnlChecks} />
            </div>
        </div>
    );
};
