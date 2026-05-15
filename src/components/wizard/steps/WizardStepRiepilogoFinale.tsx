import React from 'react';
import { FundData } from '../../../domain/types';
import { Button } from '../../shared/Button';
import { ShieldCheck, ArrowRight, Save, DatabaseBackup } from 'lucide-react';
import { formatCurrency } from '../../../utils/formatters';

interface WizardStepRiepilogoFinaleProps {
  data: FundData;
  onSaveAndContinue: () => void;
  onSaveAndExit: () => void;
  onOpenTechnicalView: () => void;
}

export const WizardStepRiepilogoFinale: React.FC<WizardStepRiepilogoFinaleProps> = ({ 
  data, 
  onSaveAndContinue,
  onSaveAndExit,
  onOpenTechnicalView
}) => {
    
    const { annualData, historicalData, fondoAccessorioDipendenteData, fondoElevateQualificazioniData } = data;
    const currentFTE = annualData.personaleServizioAttuale.reduce((acc, curr) => acc + (curr.count || 0), 0);

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                <div className="flex gap-3">
                    <ShieldCheck className="text-green-600 shrink-0" size={20} />
                    <div className="text-sm text-green-800">
                        <p className="font-bold mb-1">Riepilogo Finale e Salvataggio</p>
                        <p>
                            Hai completato la configurazione base. I dati sono attualmente salvati solo in forma di bozza temporanea.
                            Utilizza i pulsanti sottostanti per confermare e trasferire i dati alla Costituzione del Fondo globale.
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-900 border-b pb-2 mb-3 text-sm uppercase tracking-wider">Identificazione Ente</h4>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <dt className="text-gray-500">Ente</dt>
                        <dd className="font-medium text-gray-900 text-right">{annualData.denominazioneEnte || 'N/A'}</dd>
                        <dt className="text-gray-500">Anno</dt>
                        <dd className="font-medium text-gray-900 text-right">{annualData.annoRiferimento || 'N/A'}</dd>
                        <dt className="text-gray-500">Tipologia</dt>
                        <dd className="font-medium text-gray-900 text-right">{annualData.tipologiaEnte || 'N/A'}</dd>
                    </dl>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-900 border-b pb-2 mb-3 text-sm uppercase tracking-wider">Dati Storici e Personale</h4>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <dt className="text-gray-500">Limite 2016 (Dip.)</dt>
                        <dd className="font-medium text-gray-900 text-right">{formatCurrency(historicalData.fondoSalarioAccessorioPersonaleNonDirEQ2016 || historicalData.manualPersonalFundLimit2016 || 0)}</dd>
                        <dt className="text-gray-500">FTE 2018</dt>
                        <dd className="font-medium text-gray-900 text-right">{annualData.manualDipendentiEquivalenti2018 || historicalData.personaleServizio2018 || 0}</dd>
                        <dt className="text-gray-500">FTE Attuale (Base)</dt>
                        <dd className="font-medium text-gray-900 text-right">{currentFTE}</dd>
                    </dl>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-900 border-b pb-2 mb-3 text-sm uppercase tracking-wider">Parametri Normativi</h4>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <dt className="text-gray-500">Incremento D.L. 25</dt>
                        <dd className="font-medium text-gray-900 text-right">{formatCurrency(fondoAccessorioDipendenteData.st_incrementoDL25_2025 || 0)}</dd>
                        <dt className="text-gray-500">FTE Comparto (Art. 60)</dt>
                        <dd className="font-medium text-gray-900 text-right">{annualData.ccnl2024?.personaleInServizio01012026 || 0}</dd>
                        <dt className="text-gray-500">Incr. Opzionali (CCNL)</dt>
                        <dd className="font-medium text-gray-900 text-right">
                            {annualData.ccnl2024?.optionalIncreaseVariableFrom2026Percentage || annualData.ccnl2024?.optionalIncreaseVariable2026OnlyPercentage ? 'Presenti' : 'Assenti'}
                        </dd>
                    </dl>
                </div>

                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-900 border-b pb-2 mb-3 text-sm uppercase tracking-wider">Risorse Iniziali</h4>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <dt className="text-gray-500">Fondo Stabile 2017</dt>
                        <dd className="font-medium text-gray-900 text-right">{formatCurrency(fondoAccessorioDipendenteData.st_art79c1_art67c1_unicoImporto2017 || 0)}</dd>
                        <dt className="text-gray-500">Risorse EQ (2017)</dt>
                        <dd className="font-medium text-gray-900 text-right">{formatCurrency(fondoElevateQualificazioniData.ris_fondoPO2017 || 0)}</dd>
                        <dt className="text-gray-500">RIA Cessati</dt>
                        <dd className="font-medium text-gray-900 text-right">{formatCurrency(fondoAccessorioDipendenteData.st_art79c1_art4c2_art67c2c_integrazioneRIA || 0)}</dd>
                    </dl>
                </div>
            </div>

            <div className="mt-12 bg-gray-50 p-6 rounded-xl border border-gray-200 flex flex-col items-center text-center space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Come vuoi procedere?</h3>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl justify-center">
                    <Button 
                        variant="primary" 
                        size="lg" 
                        onClick={onSaveAndContinue}
                        className="flex-1 justify-center bg-green-600 hover:bg-green-700 text-white shadow-md"
                    >
                        <Save className="mr-2" size={20} />
                        Salva e vai a Costituzione
                    </Button>
                    <Button 
                        variant="secondary" 
                        size="lg" 
                        onClick={onSaveAndExit}
                        className="flex-1 justify-center bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        <DatabaseBackup className="mr-2" size={20} />
                        Salva Bozza e Esci
                    </Button>
                </div>
                <div className="pt-2">
                    <button 
                        onClick={onOpenTechnicalView}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
                    >
                        Apri la vista tecnica senza salvare <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
