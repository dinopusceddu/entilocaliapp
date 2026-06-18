import React, { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Alert } from '../components/shared/Alert';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import {
    Plus,
    Building2,
    Calendar,
    Trash2,
    Edit3,
    CheckCircle2,
    History,
    Lock,
    Unlock,
    Globe,
    User
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { filterEntitiesByScope, isGlobalAdmin } from '../application/policies/authorizationPolicy';

export const EntityYearManagementPage: React.FC = () => {
    const {
        state,
        createEntity,
        renameEntity,
        deleteEntity,
        deleteYear,
        setScopeAndTab,
        closeCurrentYear,
        switchYearAtomic
    } = useAppContext();

    const { entities, currentEntity, currentYear, currentUser } = state;

    // MOD-037C11: toggle ADMIN per la visibilità degli enti.
    // Default false = solo i propri enti. true = tutti gli enti del sistema.
    const [showAllEntities, setShowAllEntities] = useState<boolean>(false);
    const isAdmin = isGlobalAdmin(currentUser);

    // Lista enti filtrata in base al ruolo e alla scelta dell'ADMIN
    const visibleEntities = filterEntitiesByScope(entities, currentUser, showAllEntities);

    const [selectedEntityId, setSelectedEntityId] = useState<string>(currentEntity?.id || '');
    const [isCreatingEntity, setIsCreatingEntity] = useState(false);
    const [newEntityName, setNewEntityName] = useState('');
    const [editingEntityId, setEditingEntityId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');

    const [newYear, setNewYear] = useState<number>(new Date().getFullYear() + 1);
    const [entityYears, setEntityYears] = useState<{ year: number; status: string }[]>([]);
    const [isLoadingYears, setIsLoadingYears] = useState(false);

    // Sync selected entity with current entity on load or if selected entity is deleted
    useEffect(() => {
        // MOD-037C11-FIX0: usiamo entities (tutti) per evitare reset silenziosi durante il toggle
        if (currentEntity && (selectedEntityId === '' || !entities.find(e => e.id === selectedEntityId))) {
            setSelectedEntityId(currentEntity.id);
        }
    }, [currentEntity, entities, selectedEntityId]);

    const loadYearsForEntity = useCallback(async (entityId: string) => {
        if (!entityId) return;
        setIsLoadingYears(true);
        try {
            let query = supabase
                .from('user_app_state')
                .select('current_year, fund_data')
                .eq('entity_id', entityId);

            if (state.currentUser.role !== 'ADMIN') {
                query = query.eq('user_id', state.currentUser.id);
            }

            const { data, error } = await query.order('current_year', { ascending: false });

            if (error) throw error;
            setEntityYears(data ? data.map(d => ({
                year: d.current_year,
                status: (d.fund_data as any)?.metadata?.snapshotStatus || 'OPEN'
            })) : []);
        } catch (err) {
            console.error("Error loading years for entity:", err);
        } finally {
            setIsLoadingYears(false);
        }
    }, [state.currentUser.id, state.currentUser.role]);

    // Load available years for the selected entity
    useEffect(() => {
        loadYearsForEntity(selectedEntityId);
    }, [selectedEntityId, loadYearsForEntity]);

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
                const switched = await switchYearAtomic(year, ent);
                if (switched) {
                    setEntityYears(prev => {
                        const withCreatedYear = prev.some(y => y.year === year)
                            ? prev
                            : [{ year, status: 'OPEN' }, ...prev];
                        return withCreatedYear.sort((a, b) => b.year - a.year);
                    });
                    await loadYearsForEntity(ent.id);
                }
            }
        }

        setNewYear(year + 1);
    };

    const handleActivate = async (entityId: string, year: number) => {
        const entity = entities.find(e => e.id === entityId);
        if (entity) {
            try {
                await switchYearAtomic(year, entity);
                // Redirect to Fondo scope as that's the primary use for years
                setScopeAndTab('FONDO' as any, 'fundDetails');
            } catch (err) {
                console.error(`Errore durante switchYearAtomic:`, err);
            }
        }
    };

    const handleCloseYear = async () => {
        try {
            if (!selectedEntityId || !currentYear) {
                alert("Debug:selectedEntityId=" + selectedEntityId + ", currentYear=" + currentYear);
                alert("Errore: Impossibile identificare l'ente o l'anno attivo. Ricarica la pagina.");
                return;
            }

            const activeEntity = entities.find(e => e.id === selectedEntityId);
            const entName = activeEntity?.name || 'Ente selezionato';

            const message = `Stai per CHIUDERE definitivamente l'esercizio ${currentYear} per ${entName}.\n\n` +
                `Questa operazione:\n` +
                `1. Congela i dati correnti (non saranno più modificabili).\n` +
                `2. Trasferisce il risparmio FAD all'anno ${currentYear + 1}.\n\n` +
                `Procedere?`;

            if (!window.confirm(message)) {
                return;
            }

            const result = await closeCurrentYear();
            if (result.success) {
                alert(`Esercizio ${currentYear} chiuso con successo!\nRiporto FAD: € ${result.carryForward.toLocaleString('it-IT', { minimumFractionDigits: 2 })}\n\nL'anno successivo ${result.nextYear} è stato preparato.`);
                // Switch automatico all'anno successivo
                await switchYearAtomic(result.nextYear);
            } else {
                alert(`Errore durante la chiusura: ${result.error}`);
            }
        } catch (err: any) {
            console.error("UI Error during handleCloseYear:", err);
            alert(`Si è verificato un errore imprevisto: ${err.message || 'Controlla la console del browser'}`);
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
                            {isAdmin && showAllEntities ? 'Tutti gli Enti' : 'I Tuoi Enti'}
                        </h2>
                        <Button variant="secondary" size="sm" onClick={() => setIsCreatingEntity(!isCreatingEntity)}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* MOD-037C11: Banner + toggle visibilità enti — solo per ADMIN */}
                    {isAdmin && (
                        <div className={`rounded-xl border px-4 py-3 text-sm flex items-start gap-3 ${
                            showAllEntities
                                ? 'bg-amber-50 border-amber-200 text-amber-800'
                                : 'bg-blue-50 border-blue-200 text-blue-800'
                        }`}>
                            <div className="mt-0.5 shrink-0">
                                {showAllEntities
                                    ? <Globe className="w-4 h-4 text-amber-500" />
                                    : <User className="w-4 h-4 text-blue-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                {showAllEntities ? (
                                    <>
                                        <p className="font-semibold text-amber-900 mb-0.5">Vista globale attiva</p>
                                        <p className="text-xs text-amber-700 leading-snug">
                                            Stai visualizzando tutti gli enti del sistema,
                                            inclusi quelli creati da altri utenti.
                                        </p>
                                        <button
                                            data-testid="toggle-entity-scope-owned"
                                            onClick={() => setShowAllEntities(false)}
                                            className="mt-2 text-xs font-semibold underline text-amber-700 hover:text-amber-900"
                                        >
                                            ← Torna ai miei enti
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <p className="font-semibold text-blue-900 mb-0.5">Vista personale</p>
                                        <p className="text-xs text-blue-700 leading-snug">
                                            Stai visualizzando solo i tuoi enti.
                                        </p>
                                        <button
                                            data-testid="toggle-entity-scope-all"
                                            onClick={() => setShowAllEntities(true)}
                                            className="mt-2 text-xs font-semibold underline text-blue-700 hover:text-blue-900"
                                        >
                                            Mostra tutti gli enti del sistema →
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

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

                    {/* MOD-037C11-FIX0: Banner per ente selezionato ma non visibile */}
                    {currentEntity && !visibleEntities.find(e => e.id === currentEntity.id) && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <p className="font-semibold mb-1">Ente selezionato non in elenco</p>
                            <p>L'ente attualmente attivo (<strong>{currentEntity.name}</strong>) appartiene a un altro utente. Attiva <strong>Tutti gli enti del sistema</strong> per visualizzarlo nell'elenco sottostante.</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        {visibleEntities.map(entity => (
                            <div
                                key={entity.id}
                                data-testid={`entity-select-${entity.name}`}
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
                                            <div className="min-w-0">
                                                <span className="font-semibold text-text-light truncate max-w-[150px] block">{entity.name}</span>
                                                {/* MOD-037C11: badge per enti di altri utenti in vista globale */}
                                                {isAdmin && showAllEntities && entity.user_id !== currentUser?.id && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5 mt-0.5">
                                                        <Globe className="w-2.5 h-2.5" /> Ente di altro utente
                                                    </span>
                                                )}
                                            </div>
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
                                        value={isNaN(newYear) ? '' : newYear}
                                        onChange={e => {
                                            const v = parseInt(e.target.value);
                                            setNewYear(isNaN(v) ? 0 : v);
                                        }}
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
                                    {entityYears.map(yearObj => (
                                        <div
                                            key={`${selectedEntityId}-${yearObj.year}`}
                                            className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between group transition-all gap-4 ${currentEntity?.id === selectedEntityId && currentYear === yearObj.year
                                                ? 'border-green-200 bg-green-50/50'
                                                : 'border-border-light bg-white hover:border-primary/20 shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`size-10 rounded-xl flex items-center justify-center ${currentEntity?.id === selectedEntityId && currentYear === yearObj.year
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-xl font-bold text-[#1b0e0e]" data-testid={`year-title-${yearObj.year}`}>{yearObj.year}</p>
                                                        {yearObj.status === 'CLOSED' ? (
                                                            <span data-testid={`status-badge-${yearObj.year}-closed`} className="flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-gray-200">
                                                                <Lock className="w-3 h-3" /> Chiuso
                                                            </span>
                                                        ) : (
                                                            <span data-testid={`status-badge-${yearObj.year}-open`} className="flex items-center gap-1 bg-green-100 text-green-600 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-green-200">
                                                                <Unlock className="w-3 h-3" /> Aperto
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-[#5f5252]">Fondo Salario Accessorio</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-2">
                                                {currentEntity?.id === selectedEntityId && currentYear === yearObj.year ? (
                                                    <div className="flex items-center gap-3">
                                                        {yearObj.status !== 'CLOSED' && (
                                                            <Button
                                                                data-testid="close-year-button"
                                                                variant="danger"
                                                                size="sm"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    handleCloseYear();
                                                                }}
                                                            >
                                                                Chiudi Esercizio
                                                            </Button>
                                                        )}
                                                        <span data-testid={`badge-active-year-${yearObj.year}`} className="flex items-center gap-1 text-green-600 text-[10px] font-bold uppercase whitespace-nowrap bg-green-50 px-2 py-1 rounded-md border border-green-100">
                                                            <CheckCircle2 className="w-3.5 h-3.5" /> In Uso
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        data-testid={`activate-year-${yearObj.year}`}
                                                        style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                                                        onClick={() => {
                                                            console.log("Attivazione anno:", yearObj.year);
                                                            handleActivate(selectedEntityId, yearObj.year);
                                                        }}
                                                    >
                                                        Attiva
                                                    </button>
                                                )}
                                                {yearObj.status !== 'CLOSED' && (
                                                    <button
                                                        className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                        onClick={() => deleteYear(selectedEntityId, yearObj.year)}
                                                        title="Elimina anno"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                )}
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
