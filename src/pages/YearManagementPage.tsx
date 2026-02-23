import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';
import { Input } from '../components/shared/Input';
import { Alert } from '../components/shared/Alert';
import { Plus, Calendar, CheckCircle } from 'lucide-react';

export const YearManagementPage: React.FC = () => {
    const { state, dispatch, availableYears, saveState } = useAppContext();
    const { currentYear, isLoading } = state;
    const [newYear, setNewYear] = useState<string>((new Date().getFullYear() + 1).toString());
    const [createError, setCreateError] = useState<string | null>(null);

    const handleSwitchYear = (year: number) => {
        if (year === currentYear) return;
        dispatch({ type: 'SET_CURRENT_YEAR', payload: year });
        // The AppContext useEffect will handle loading the data for the new year
    };

    const handleCreateYear = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreateError(null);
        const yearNum = parseInt(newYear);

        if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
            setCreateError("Inserisci un anno valido (2000-2100).");
            return;
        }

        if (availableYears.includes(yearNum)) {
            setCreateError("Questo anno esiste già.");
            return;
        }

        // Switch to the new year. 
        // Important: This will trigger the AppContext loading logic. 
        // If the row doesn't exist in DB, AppContext will just load defaults.
        // Then we immediately save to persist it in DB with the new key.

        dispatch({ type: 'SET_CURRENT_YEAR', payload: yearNum });

        // We need to wait for state update to persist? 
        // Actually, dispatch is synchronous for state reduction, but side effects in useEffect are async.
        // However, we can force a save of the *current* state (which is technically the OLD year state but with NEW year value due to reducer) 
        // IF we didn't just clear the data.

        // BETTER APPROACH: 
        // 1. Dispatch SET_CURRENT_YEAR
        // 2. Dispatch a "RESET_DATA_FOR_NEW_YEAR" action? 
        //    Or just let the AppContext fetch fail (404) and then we initialize fresh defaults?

        // Current AppContext logic:
        // if FETCH returns null -> it keeps defaultInitialState (which is empty/fresh).
        // Then we call saveState() to create the row.

        // Let's implement a small delay to allow context to switch and then save.
        // A cleaner way would be to have a straight "CREATE_YEAR" action but our backend is Supabase direct.

        setTimeout(() => {
            saveState();
        }, 500);

        setNewYear((yearNum + 1).toString());
    };

    return (
        <div className="space-y-8">
            <div className="border-b border-[#f3e7e8] pb-4">
                <h2 className="text-[#1b0e0e] text-2xl font-bold leading-tight">Gestione Anni</h2>
                <p className="text-[#5f5252] mt-1">
                    Gestisci le annualità del fondo. Crea nuovi anni o passa a quelli esistenti.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Active Year & History */}
                <div className="space-y-6">
                    <Card title="Anno Corrente Attivo">
                        <div className="flex items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-100">
                            <Calendar className="h-8 w-8 text-[#ea2832]" />
                            <div>
                                <p className="text-sm text-red-600 font-medium uppercase tracking-wider">Stai lavorando sul</p>
                                <p className="text-3xl font-bold text-[#ea2832]">{currentYear}</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Storico Annualità">
                        <div className="space-y-3">
                            {availableYears.length === 0 && (
                                <p className="text-gray-500 italic">Nessun altro anno disponibile.</p>
                            )}
                            {availableYears.map((year) => (
                                <button
                                    key={year}
                                    onClick={() => handleSwitchYear(year)}
                                    disabled={isLoading || year === currentYear}
                                    className={`w-full flex items-center justify-between p-3 rounded-md transition-colors ${year === currentYear
                                        ? 'bg-gray-100 border border-gray-200 cursor-default'
                                        : 'bg-white border border-gray-200 hover:border-red-300 hover:bg-red-50'
                                        }`}
                                >
                                    <span className={`font-semibold ${year === currentYear ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {year}
                                    </span>
                                    {year === currentYear && <CheckCircle className="h-5 w-5 text-green-600" />}
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Create New Year */}
                <div>
                    <Card title="Crea Nuova Annualità">
                        <form onSubmit={handleCreateYear} className="space-y-4">
                            <p className="text-sm text-gray-600">
                                La creazione di un nuovo anno inizializzerà un set di dati vuoto.
                                Potrai successivamente importare i dati storici se necessario.
                            </p>

                            <Input
                                label="Anno"
                                type="number"
                                min="2000"
                                max="2100"
                                value={newYear}
                                onChange={(e) => setNewYear(e.target.value)}
                                placeholder="Es. 2026"
                                required
                            />

                            {createError && (
                                <Alert type="error" title="Errore" message={createError} />
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading}
                                isLoading={isLoading}
                                className="w-full flex items-center justify-center gap-2"
                            >
                                <Plus className="h-4 w-4" /> Crea Annualità
                            </Button>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};
