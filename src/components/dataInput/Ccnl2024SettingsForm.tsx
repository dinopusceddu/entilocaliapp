import React from 'react';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';
import { Ccnl2024Settings } from '../../types';
import { IvcConglobationModal } from '../modals/IvcConglobationModal';
import { HelpCircle, Calculator } from 'lucide-react';
import { Modal } from '../shared/Modal';
import { formatCurrency } from '../../utils/formatters.ts';

interface Ccnl2024SettingsFormProps {
    data: Ccnl2024Settings | undefined;
    onChange: (data: Ccnl2024Settings) => void;
    fondoLavoroStraordinario?: number;
    onFondoLavoroStraordinarioChange?: (value: number | undefined) => void;
    incrementoFondoStraordinario?: number;
    onIncrementoFondoStraordinarioChange?: (value: number | undefined) => void;
    riduzioneFondoParteStabile?: boolean;
    onRiduzioneFondoParteStabileChange?: (value: boolean) => void;
    hasDirigenza?: boolean;
}

export const Ccnl2024SettingsForm: React.FC<Ccnl2024SettingsFormProps> = ({
    data,
    onChange,
    fondoLavoroStraordinario,
    onFondoLavoroStraordinarioChange,
    incrementoFondoStraordinario,
    onIncrementoFondoStraordinarioChange,
    riduzioneFondoParteStabile,
    onRiduzioneFondoParteStabileChange,
    hasDirigenza
}) => {
    const settings = data || {};

    const handleChange = (field: keyof Ccnl2024Settings, value: any) => {
        onChange({
            ...settings,
            [field]: value,
        });
    };

    const [isIvcModalOpen, setIsIvcModalOpen] = React.useState(false);
    const [showMonteSalariHelp, setShowMonteSalariHelp] = React.useState(false);

    const ivcData = settings.ivcConglobation || { mode: 'aggregated', aggregatedCounts: {}, analyticEmployees: [], totalReduction: 0 };

    const handleIvcSave = (newData: any) => {
        onChange({
            ...settings,
            ivcConglobation: newData,
        });
    };

    const nuovoFondoLavoroStraordinario = (fondoLavoroStraordinario || 0) + (incrementoFondoStraordinario || 0);

    return (
        <div className="space-y-6">
            {isIvcModalOpen && (
                <IvcConglobationModal
                    isOpen={isIvcModalOpen}
                    onClose={() => setIsIvcModalOpen(false)}
                    data={ivcData}
                    onSave={handleIvcSave}
                />
            )}

            {/* Section 1: Monte Salari & Base Funds */}
            <Card title="Dati Base CCNL 2022-2024">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="col-span-1 md:col-span-2 lg:col-span-1 border-r border-gray-100 pr-0 lg:pr-6">
                        <div className="flex items-center gap-2 mb-2">
                            <label htmlFor="monteSalari2021" className="text-sm font-semibold text-gray-900">
                                Monte Salari 2021
                            </label>
                            <button onClick={() => setShowMonteSalariHelp(true)} className="text-blue-500 hover:text-blue-700">
                                <HelpCircle size={16} />
                            </button>
                        </div>
                        <Input
                            id="monteSalari2021"
                            type="number"
                            value={settings.monteSalari2021 || ''}
                            onChange={(e) => handleChange('monteSalari2021', parseFloat(e.target.value))}
                            placeholder="0.00"
                            required
                            containerClassName="!mb-0"
                            inputInfo="Base di calcolo per tutti gli incrementi."
                        />
                    </div>

                    <div className="col-span-1">
                        <Input
                            label="Fondo Personale 2024 (Riparto)"
                            type="number"
                            value={settings.fondoPersonale2025 || ''}
                            onChange={(e) => handleChange('fondoPersonale2025', parseFloat(e.target.value))}
                            placeholder="0.00"
                            containerClassName="!mb-0"
                        />
                    </div>
                    <div className="col-span-1">
                        <Input
                            label="Fondo EQ 2024 (Riparto)"
                            type="number"
                            value={settings.fondoEQ2025 || ''}
                            onChange={(e) => handleChange('fondoEQ2025', parseFloat(e.target.value))}
                            placeholder="0.00"
                            containerClassName="!mb-0"
                        />
                    </div>
                </div>
            </Card>

            {/* Section 2: Optional Increases */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Incrementi Facoltativi (Max 0,22%)">
                    <div className="space-y-4">
                        <Input
                            label="Incr. Variabile (dal 2026) %"
                            type="number"
                            min="0"
                            max="0.22"
                            step="0.01"
                            value={settings.optionalIncreaseVariableFrom2026Percentage || ''}
                            onChange={(e) => handleChange('optionalIncreaseVariableFrom2026Percentage', parseFloat(e.target.value))}
                            placeholder="Es. 0.22"
                        />
                        <Input
                            label="Incr. Una Tantum %"
                            type="number"
                            min="0"
                            max="0.22"
                            step="0.01"
                            value={settings.optionalIncreaseVariable2026OnlyPercentage || ''}
                            onChange={(e) => handleChange('optionalIncreaseVariable2026OnlyPercentage', parseFloat(e.target.value))}
                            placeholder="Es. 0.22"
                        />
                    </div>
                </Card>

                <Card title="Conglobamento IVC">
                    <div className="flex flex-col h-full justify-between">
                        <p className="text-sm text-gray-500 mb-4">
                            Calcolo riduzione stabile (Tab. C, CCNL 16.11.2022).
                        </p>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div>
                                <span className="block text-xs uppercase text-gray-500 font-bold">Riduzione</span>
                                <span className="text-xl font-bold text-red-600">
                                    {formatCurrency(ivcData.totalReduction || 0)}
                                </span>
                            </div>
                            <button
                                onClick={() => setIsIvcModalOpen(true)}
                                className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700 shadow-sm"
                                title="Apri Calcolatrice"
                            >
                                <Calculator size={20} />
                            </button>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Section 3: Straordinario */}
            <Card title="Fondo Straordinario">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    {onFondoLavoroStraordinarioChange && (
                        <Input
                            label="Consolidato (€)"
                            type="number"
                            value={fondoLavoroStraordinario ?? ''}
                            onChange={(e) => onFondoLavoroStraordinarioChange(parseFloat(e.target.value) || undefined)}
                            placeholder="0.00"
                            step="0.01"
                            containerClassName="!mb-0"
                        />
                    )}
                    {onIncrementoFondoStraordinarioChange && (
                        <Input
                            label="Incremento (€)"
                            type="number"
                            value={incrementoFondoStraordinario ?? ''}
                            onChange={(e) => onIncrementoFondoStraordinarioChange(parseFloat(e.target.value) || undefined)}
                            placeholder="0.00"
                            step="0.01"
                            containerClassName="!mb-0"
                        />
                    )}
                    <div className="p-3 bg-gray-100 rounded-lg text-right">
                        <span className="block text-xs text-gray-500">Nuovo Totale</span>
                        <span className="font-bold text-gray-900">
                            {formatCurrency(nuovoFondoLavoroStraordinario)}
                        </span>
                    </div>
                </div>
                {!hasDirigenza && onRiduzioneFondoParteStabileChange && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={!!riduzioneFondoParteStabile}
                                onChange={(e) => onRiduzioneFondoParteStabileChange(e.target.checked)}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">Riduci fondo stabile per finanziare l'incremento?</span>
                        </label>
                    </div>
                )}
            </Card>

            <Modal
                isOpen={showMonteSalariHelp}
                onClose={() => setShowMonteSalariHelp(false)}
                title="Calcolo Monte Salari 2021"
            >
                <div className="space-y-4 text-sm text-gray-700">
                    <p>
                        Il monte salari si calcola sommando le voci di trattamento economico principale e accessorio (incluse incentivazioni) dell'anno 2021,
                        al netto di oneri riflessi, escludendo assegni familiari, indennità di trasferta/mensa, equo indennizzo e arretrati.
                    </p>
                </div>
            </Modal>
        </div>
    );
};
