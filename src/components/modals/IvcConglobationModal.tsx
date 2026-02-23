import React, { useState, useEffect } from 'react';
import { IvcConglobationData, AreaQualifica, IvcConglobationEmployee } from '../../types';
import { calculateIvcReduction } from '../../logic/ivcCalculations';
import { Input } from '../shared/Input';
import { X, Trash2, Plus } from 'lucide-react';
import { ALL_AREE_QUALIFICA, IVC_VALUES } from '../../constants';
import { formatCurrency } from '../../utils/formatters';

interface IvcConglobationModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: IvcConglobationData;
    onSave: (data: IvcConglobationData) => void;
}

export const IvcConglobationModal: React.FC<IvcConglobationModalProps> = ({
    isOpen,
    onClose,
    data,
    onSave,
}) => {
    const [localData, setLocalData] = useState<IvcConglobationData>(data);
    const [activeTab, setActiveTab] = useState<'aggregated' | 'analytic'>(data.mode);

    useEffect(() => {
        setLocalData(data);
        setActiveTab(data.mode);
    }, [data, isOpen]);

    useEffect(() => {
        // Recalculate total whenever localData changes (but only if consistent with activeTab)
        const newTotal = calculateIvcReduction({ ...localData, mode: activeTab });
        if (newTotal !== localData.totalReduction) {
            setLocalData(prev => ({ ...prev, totalReduction: newTotal }));
        }
    }, [localData.aggregatedCounts, localData.analyticEmployees, activeTab]);

    if (!isOpen) return null;

    const handleModeChange = (mode: 'aggregated' | 'analytic') => {
        setActiveTab(mode);
        setLocalData(prev => ({ ...prev, mode }));
    };

    const handleAggregatedChange = (area: AreaQualifica, value: number) => {
        setLocalData(prev => ({
            ...prev,
            aggregatedCounts: {
                ...prev.aggregatedCounts,
                [area]: value,
            },
        }));
    };

    const handleAddEmployee = () => {
        const newEmp: IvcConglobationEmployee = {
            id: crypto.randomUUID(),
            area: AreaQualifica.ISTRUTTORE,
            partTimePercentage: 100.00
        };
        setLocalData(prev => ({
            ...prev,
            analyticEmployees: [...(prev.analyticEmployees || []), newEmp]
        }));
    };

    const handleRemoveEmployee = (id: string) => {
        setLocalData(prev => ({
            ...prev,
            analyticEmployees: (prev.analyticEmployees || []).filter(e => e.id !== id)
        }));
    };

    const handleUpdateEmployee = (id: string, field: keyof IvcConglobationEmployee, value: any) => {
        setLocalData(prev => ({
            ...prev,
            analyticEmployees: (prev.analyticEmployees || []).map(e =>
                e.id === id ? { ...e, [field]: value } : e
            )
        }));
    };

    const handleSave = () => {
        onSave({ ...localData, mode: activeTab });
        onClose();
    };



    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900">
                        Calcolo Riduzione Conglobamento IVC
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="mb-6">
                        <p className="text-sm text-gray-600 mb-4">
                            La riduzione è calcolata sommando i valori di entrambe le sezioni (Aggregata + Analitica).
                            I valori tabellari mensili (Tab. C, Col. 3 CCNL 16.11.2022) sono moltiplicati per 13 mensilità.
                        </p>
                        <div className="flex space-x-4 border-b border-gray-200">
                            <button
                                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'aggregated'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                onClick={() => handleModeChange('aggregated')}
                            >
                                Sezione A: Aggregato (Teste Intere)
                            </button>
                            <button
                                className={`py-2 px-4 border-b-2 font-medium text-sm ${activeTab === 'analytic'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                onClick={() => handleModeChange('analytic')}
                            >
                                Sezione B: Analitico (Part-Time)
                            </button>
                        </div>
                    </div>

                    {activeTab === 'aggregated' ? (
                        <div className="space-y-4">
                            <p className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-100">
                                Inserisci il numero di dipendenti per ciascuna area. Il calcolo presuppone tempo pieno (1.0).
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {ALL_AREE_QUALIFICA.map((area) => (
                                    <div key={area.value} className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">{area.label}</label>
                                            <span className="text-xs text-gray-500">
                                                Unitario Annuo: {formatCurrency(IVC_VALUES[area.value] * 13)}
                                            </span>
                                        </div>
                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                min="0"
                                                value={localData.aggregatedCounts?.[area.value] || ''}
                                                onChange={(e) => handleAggregatedChange(area.value, parseFloat(e.target.value))}
                                                placeholder="0"
                                                containerClassName="mb-0"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs text-gray-500 bg-blue-50 p-2 rounded border border-blue-100">
                                Aggiungi i dipendenti singolarmente specificando la percentuale di Part-Time per un calcolo preciso.
                            </p>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleAddEmployee}
                                    className="flex items-center text-sm text-blue-600 font-medium hover:text-blue-800"
                                >
                                    <Plus className="w-4 h-4 mr-1" /> Aggiungi Dipendente
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricola / ID</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% Part-Time</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Riduzione Calcolata</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {localData.analyticEmployees?.map((emp) => (
                                            <tr key={emp.id}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Input
                                                        value={emp.matricola || ''}
                                                        onChange={(e) => handleUpdateEmployee(emp.id, 'matricola', e.target.value)}
                                                        placeholder="Matricola"
                                                        containerClassName="mb-0 w-32"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <select
                                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                        value={emp.area}
                                                        onChange={(e) => handleUpdateEmployee(emp.id, 'area', e.target.value)}
                                                    >
                                                        {ALL_AREE_QUALIFICA.map(a => (
                                                            <option key={a.value} value={a.value}>{a.label}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        max="100"
                                                        value={emp.partTimePercentage}
                                                        onChange={(e) => handleUpdateEmployee(emp.id, 'partTimePercentage', parseFloat(e.target.value))}
                                                        containerClassName="mb-0 w-24"
                                                    />
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatCurrency((IVC_VALUES[emp.area] * 13 * ((emp.partTimePercentage || 0) / 100)))}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => handleRemoveEmployee(emp.id)} className="text-red-600 hover:text-red-900">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!localData.analyticEmployees || localData.analyticEmployees.length === 0) && (
                                    <div className="text-center py-8 text-gray-500 text-sm">
                                        Nessun dipendente inserito. Clicca su "Aggiungi Dipendente".
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-200">
                    <div>
                        <span className="text-sm font-medium text-gray-700">Totale Riduzione (A + B):</span>
                        <span className="ml-2 text-xl font-bold text-red-600">{formatCurrency(localData.totalReduction)}</span>
                        <p className="text-xs text-gray-500">Questa somma riduce stabilmente il fondo.</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                        >
                            Annulla
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none"
                        >
                            Salva Calcolo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
