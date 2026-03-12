import React, { useEffect, useState } from 'react';
import { AppFeedback, FeedbackStatus, FeedbackType, UserRole } from '../types';
import { getAllFeedback, updateFeedbackStatus, deleteFeedback } from '../services/feedbackService';
import { Card } from '../components/shared/Card';
import { useAppContext } from '../contexts/AppContext';
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    XCircle,
    MessageSquare,
    Bug,
    Lightbulb,
    ChevronDown,
    ChevronUp,
    Trash2,
    Save
} from 'lucide-react';

export const FeedbackAdminPage: React.FC = () => {
    const { state } = useAppContext();
    const [feedbacks, setFeedbacks] = useState<AppFeedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [editingStatus, setEditingStatus] = useState<Record<string, FeedbackStatus>>({});
    const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

    const isAdmin = state.currentUser.role === UserRole.ADMIN;

    useEffect(() => {
        loadFeedbacks();
    }, []);

    const loadFeedbacks = async () => {
        setIsLoading(true);
        try {
            const data = await getAllFeedback();
            setFeedbacks(data);

            // Initialize editing states
            const statusMap: Record<string, FeedbackStatus> = {};
            const notesMap: Record<string, string> = {};
            data.forEach(f => {
                statusMap[f.id] = f.status;
                notesMap[f.id] = f.admin_notes || '';
            });
            setEditingStatus(statusMap);
            setEditingNotes(notesMap);
        } catch (err) {
            console.error('Error loading feedbacks:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdate = async (id: string) => {
        setIsSaving(id);
        try {
            await updateFeedbackStatus(id, editingStatus[id], editingNotes[id]);
            await loadFeedbacks();
        } catch (err) {
            console.error('Error updating feedback:', err);
        } finally {
            setIsSaving(null);
        }
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            await deleteFeedback(id);
            setFeedbacks(feedbacks.filter(f => f.id !== id));
            setConfirmingDelete(null);
        } catch (err) {
            console.error('Error deleting feedback:', err);
            alert('Errore durante la cancellazione della segnalazione. Verifica i permessi del database.');
        } finally {
            setIsDeleting(null);
        }
    };

    const getStatusIcon = (status: FeedbackStatus) => {
        switch (status) {
            case FeedbackStatus.OPEN: return <Clock size={18} className="text-amber-500" />;
            case FeedbackStatus.IN_PROGRESS: return <AlertCircle size={18} className="text-blue-500" />;
            case FeedbackStatus.RESOLVED: return <CheckCircle2 size={18} className="text-green-500" />;
            case FeedbackStatus.CLOSED: return <XCircle size={18} className="text-slate-400" />;
        }
    };

    const getStatusLabel = (status: FeedbackStatus) => {
        switch (status) {
            case FeedbackStatus.OPEN: return 'Aperto';
            case FeedbackStatus.IN_PROGRESS: return 'In Lavoro';
            case FeedbackStatus.RESOLVED: return 'Risolto';
            case FeedbackStatus.CLOSED: return 'Chiuso';
        }
    };

    const getTypeIcon = (type: FeedbackType) => {
        switch (type) {
            case FeedbackType.BUG: return <Bug size={18} className="text-red-500" />;
            case FeedbackType.FEATURE_REQUEST: return <Lightbulb size={18} className="text-blue-500" />;
            case FeedbackType.CHANGE_REQUEST: return <MessageSquare size={18} className="text-amber-500" />;
        }
    };

    if (!isAdmin) {
        return (
            <Card className="text-center py-12">
                <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold">Accesso Negato</h2>
                <p className="text-slate-600 mt-2">Questa pagina è riservata agli amministratori.</p>
            </Card>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 border-b-2 border-primary w-fit pb-1">
                        Gestione Feedback e Bug
                    </h1>
                    <p className="text-slate-500 mt-2">Monitora e gestisci le segnalazioni degli utenti.</p>
                </div>
                <button
                    onClick={loadFeedbacks}
                    className="p-2 hover:bg-slate-100 rounded-full transition"
                    title="Aggiorna lista"
                >
                    <Clock size={20} className="text-slate-500" />
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : feedbacks.length === 0 ? (
                <Card className="text-center py-12">
                    <MessageSquare size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Nessuna segnalazione trovata.</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {feedbacks.map((item) => (
                        <Card key={item.id} className="overflow-hidden border-l-4" style={{ borderLeftColor: item.status === FeedbackStatus.OPEN ? '#f59e0b' : item.status === FeedbackStatus.IN_PROGRESS ? '#3b82f6' : item.status === FeedbackStatus.RESOLVED ? '#10b981' : '#94a3b8' }}>
                            <div
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition"
                                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="p-2 bg-slate-100 rounded-lg">
                                        {getTypeIcon(item.type)}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">{item.title}</h3>
                                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-500 font-medium italic">
                                            <span className="flex items-center gap-1">
                                                <small className="not-italic">Utente:</small> {item.user_name}
                                            </span>
                                            <span>
                                                <small className="not-italic">Data:</small> {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                        ${item.status === FeedbackStatus.OPEN ? 'bg-amber-50 text-amber-700' :
                                            item.status === FeedbackStatus.IN_PROGRESS ? 'bg-blue-50 text-blue-700' :
                                                item.status === FeedbackStatus.RESOLVED ? 'bg-green-50 text-green-700' : 'bg-slate-50 text-slate-600'}`}>
                                        {getStatusIcon(item.status)}
                                        {getStatusLabel(item.status)}
                                    </div>
                                    {expandedId === item.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                </div>
                            </div>

                            {expandedId === item.id && (
                                <div className="p-6 bg-slate-50 border-t border-slate-200 animate-slide-down">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <MessageSquare size={14} />
                                                Dettaglio Segnalazione
                                            </h4>
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 whitespace-pre-wrap leading-relaxed shadow-sm">
                                                {item.description}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <Save size={14} />
                                                Gestione Amministrativa
                                            </h4>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Stato Lavorazione</label>
                                                    <select
                                                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none shadow-sm"
                                                        value={editingStatus[item.id]}
                                                        onChange={(e) => setEditingStatus({ ...editingStatus, [item.id]: e.target.value as FeedbackStatus })}
                                                    >
                                                        <option value={FeedbackStatus.OPEN}>Aperto</option>
                                                        <option value={FeedbackStatus.IN_PROGRESS}>In Lavorazione</option>
                                                        <option value={FeedbackStatus.RESOLVED}>Risolto</option>
                                                        <option value={FeedbackStatus.CLOSED}>Chiuso / Respinto</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-2 uppercase">Note Amministrative (Private)</label>
                                                    <textarea
                                                        className="w-full p-3 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-primary/20 outline-none min-h-[80px] shadow-sm"
                                                        placeholder="Inserisci note tecniche o commenti sulla risoluzione..."
                                                        value={editingNotes[item.id]}
                                                        onChange={(e) => setEditingNotes({ ...editingNotes, [item.id]: e.target.value })}
                                                    />
                                                </div>

                                                <div className="flex gap-3 justify-end pt-2">
                                                    {confirmingDelete === item.id ? (
                                                        <div className="flex items-center gap-2 animate-fade-in">
                                                            <span className="text-xs font-bold text-red-600 mr-2">Confermi l'eliminazione?</span>
                                                            <button
                                                                onClick={() => setConfirmingDelete(null)}
                                                                className="px-3 py-1.5 text-slate-500 hover:bg-slate-200 rounded-lg text-sm font-bold transition"
                                                            >
                                                                Annulla
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                disabled={isDeleting === item.id}
                                                                className="px-4 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-bold transition flex items-center gap-2"
                                                            >
                                                                {isDeleting === item.id ? 'Eliminazione...' : 'Conferma'}
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setConfirmingDelete(item.id)}
                                                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-bold transition"
                                                        >
                                                            <Trash2 size={16} />
                                                            Elimina
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleUpdate(item.id)}
                                                        disabled={isSaving === item.id || confirmingDelete === item.id}
                                                        className="flex items-center gap-2 px-6 py-2 bg-primary text-white hover:bg-primary-dark rounded-lg text-sm font-bold transition shadow-lg shadow-primary/20 disabled:opacity-50"
                                                    >
                                                        {isSaving === item.id ? (
                                                            'Salvataggio...'
                                                        ) : (
                                                            <>
                                                                <Save size={16} />
                                                                Salva Modifiche
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
