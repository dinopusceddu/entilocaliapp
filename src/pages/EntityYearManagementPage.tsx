import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Alert } from '../components/shared/Alert';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Plus, Building2, Calendar, Trash2, Edit3, CheckCircle2, ArrowRightCircle, History } from 'lucide-react';
import { supabase } from '../services/supabase';

export const EntityYearManagementPage: React.FC = () => {
    const {
        state,
        dispatch,
        availableYears,
        createEntity,
        renameEntity,
        deleteEntity,
        deleteYear,
        setScopeAndTab
    } = useAppContext();

    const { entities, currentEntity, currentYear } = state;

    const [selectedEntityId, setSelectedEntityId] = useState<string>(currentEntity?.id || '');
    const [isCreatingEntity, setIsCreatingEntity] = useState(false);
    const [newEntityName, setNewEntityName] = useState('');
    const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const [newYear, setNewYear] = useState<number>(new Date().getFullYear() + 1);
    const [entityYears, setEntityYears] = useState<number[]>([]);
    const [isLoadingYears, setIsLoadingYears] = useState(false);

    // Sync selected entity with current entity on load
    useEffect(() => {
        if (currentEntity && !selectedEntityId) {
            setSelectedEntityId(currentEntity.id);
        }
    }, [currentEntity]);

    // Load available years for the selected entity
    useEffect(() => {
        const loadYears = async () => {
            if (!selectedEntityId) return;
            setIsLoadingYears(true);
            try {
                const { data, error } = await supabase
                    .from('user_app_state')
                    .select('current_year')
                    .eq('entity_id', selectedEntityId)
                    .order('current_year', { ascending: false });

                if (error) throw error;
                setEntityYears(data ? data.map(d => d.current_year) : []);
            } catch (err) {
                console.error("Error loading years for entity:", err);
            } finally {
                setIsLoadingYears(false);
            }
        };
        loadYears();
    }, [selectedEntityId, availableYears]); // availableYears is a dependency to refresh when we create/delete via Context

    const handleCreateEntity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newEntityName.trim()) {
            await createEntity(newEntityName);
            setNewEntityName('');
            setIsCreatingEntity(false);
        }
    };

    const handleRename = async (id: string) => {
        if (editName.trim()) {
            await renameEntity(id, editName);
            setEditingEntityId(null);
        }
    };

    const handleCreateYear = async () => {
        const year = newYear;
        if (isNaN(year) || year < 2000 || year > 2100) return;

        if (selectedEntityId) {
            const ent = entities.find(e => e.id === selectedEntityId);
            if (ent) {
                dispatch({ type: 'SET_CURRENT_ENTITY', payload: ent });
                dispatch({ type: 'SET_CURRENT_YEAR', payload: year });
            }
        }

        // Small delay to let DB reflect
        setTimeout(() => {
            setNewYear(year + 1);
        }, 500);
    };

    const handleActivate = (entityId: string, year: number) => {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
            dispatch({ type: 'SET_CURRENT_ENTITY', payload: entity });
            dispatch({ type: 'SET_CURRENT_YEAR', payload: year });
            // Redirect to Fondo scope as that's the primary use for years
            setScopeAndTab('FONDO' as any, 'fundDetails');
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto py-8 px-4 space-y-8 animate-fade-in">
            <div className="border-b border-[#f3e7e8] pb-6">
                <h1 className="text-3xl font-bold text-[#1b0e0e] tracking-tight">Creazione Enti e Gestione Anni</h1>
                <p className="text-[#5f5252] mt-2 text-lg">
                    Amministra i tuoi enti e le relative annualità in un unico posto.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* 1. Lista Enti */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#1b0e0e] flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-primary" />
                            I Tuoi Enti
                        </h2>
                        <Button variant="secondary" size="sm" onClick={() => setIsCreatingEntity(!isCreatingEntity)}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {isCreatingEntity && (
                        <Card className="border-primary/20 bg-primary/5">
                            <form onSubmit={handleCreateEntity} className="space-y-4">
                                <Input
                                    label="Nuovo Ente"
                                    placeholder="Es. Comune di..."
                                    value={newEntityName}
                                    onChange={e => setNewEntityName(e.target.value)}
                                    autoFocus
                                />
                                <div className="flex gap-2">
                                    <Button type="submit" size="sm" className="flex-1">Crea</Button>
                                    <Button type="button" variant="secondary" size="sm" onClick={() => setIsCreatingEntity(false)}>Annulla</Button>
                                </div>
                            </form>
                        </Card>
                    )}

                    <div className="space-y-3">
                        {entities.map(entity => (
                            <div
                                key={entity.id}
                                onClick={() => setSelectedEntityId(entity.id)}
                                className={`p-4 rounded-xl border transition-all cursor-pointer group relative ${selectedEntityId === entity.id
                                    ? 'border-primary bg-primary/5 shadow-sm'
                                    : 'border-border-light bg-white hover:border-primary/30'
                                    }`}
                            >
                                {editingEntityId === entity.id ? (
                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <Input
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            autoFocus
                                        />
                                        <Button size="sm" onClick={() => handleRename(entity.id)}><CheckCircle2 className="w-4 h-4" /></Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${selectedEntityId === entity.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <span className="font-semibold text-text-light truncate max-w-[150px]">{entity.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                                            <button
                                                onClick={() => { setEditingEntityId(entity.id); setEditName(entity.name); }}
                                                className="p-1 hover:text-primary"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteEntity(entity.id)}
                                                className="p-1 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {currentEntity?.id === entity.id && (
                                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shadow-sm">
                                        Attivo
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* 2. Lista Anni */}
                <div className="lg:col-span-2 space-y-6">
                    {selectedEntityId ? (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-[#1b0e0e] flex items-center gap-2">
                                    <History className="w-5 h-5 text-primary" />
                                    Annualità per {entities.find(e => e.id === selectedEntityId)?.name}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        className="w-24 h-9"
                                        value={newYear}
                                        onChange={e => setNewYear(parseInt(e.target.value))}
                                    />
                                    <Button size="sm" onClick={handleCreateYear}>
                                        <Plus className="w-4 h-4 mr-1" /> Crea Anno
                                    </Button>
                                </div>
                            </div>

                            {isLoadingYears ? (
                                <LoadingSpinner text="Caricamento anni..." />
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {entityYears.length === 0 && (
                                        <div className="col-span-full py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500">Nessun anno creato per questo ente.</p>
                                        </div>
                                    )}
                                    {entityYears.map(year => (
                                        <div
                                            key={`${selectedEntityId}-${year}`}
                                            className={`p-5 rounded-2xl border flex items-center justify-between group transition-all ${currentEntity?.id === selectedEntityId && currentYear === year
                                                ? 'border-green-200 bg-green-50/50'
                                                : 'border-border-light bg-white hover:border-primary/20 shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`size-10 rounded-xl flex items-center justify-center ${currentEntity?.id === selectedEntityId && currentYear === year
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xl font-bold text-[#1b0e0e]">{year}</p>
                                                    <p className="text-xs text-[#5f5252]">Fondo Salario Accessorio</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {currentEntity?.id === selectedEntityId && currentYear === year ? (
                                                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold uppercase">
                                                        <CheckCircle2 className="w-4 h-4" /> Attivo
                                                    </span>
                                                ) : (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="opacity-0 group-hover:opacity-100 h-9 px-3"
                                                        onClick={() => handleActivate(selectedEntityId, year)}
                                                    >
                                                        Attiva <ArrowRightCircle className="ml-2 w-4 h-4" />
                                                    </Button>
                                                )}
                                                <button
                                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                    onClick={() => deleteYear(selectedEntityId, year)}
                                                    title="Elimina anno"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Alert
                                type="info"
                                title="Informazione"
                                message="L'attivazione di un Ente e di un Anno imposta il contesto globale dell'app. Tutti i dati visualizzati nei moduli saranno relativi alla selezione attiva."
                            />
                        </>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center py-20 text-center text-gray-400">
                            <Building2 className="w-16 h-16 mb-4 opacity-20" />
                            <p className="text-lg">Seleziona un ente a sinistra per gestirne le annualità</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
