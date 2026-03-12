import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { FeedbackType, AppFeedback, FeedbackStatus } from '../types';
import { submitFeedback, getUserFeedback, deleteFeedback as deleteFeedbackService } from '../services/feedbackService';
import { Card } from '../components/shared/Card';
import { Input } from '../components/shared/Input';
import { MessageSquare, Bug, Lightbulb, Send, CheckCircle2, History, Trash2, Clock, AlertCircle } from 'lucide-react';

export const FeedbackPage: React.FC = () => {
    const { state } = useAppContext();
    const [type, setType] = useState<FeedbackType>(FeedbackType.BUG);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [myFeedbacks, setMyFeedbacks] = useState<AppFeedback[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

    React.useEffect(() => {
        loadMyFeedbacks();
    }, [state.currentUser.id]);

    const loadMyFeedbacks = async () => {
        setIsLoadingHistory(true);
        try {
            const data = await getUserFeedback(state.currentUser.id);
            setMyFeedbacks(data);
        } catch (err) {
            console.error('Error loading history:', err);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleDelete = async (id: string, status: FeedbackStatus) => {
        if (status !== FeedbackStatus.OPEN) {
            alert('Non è possibile cancellare una segnalazione già presa in carico.');
            setConfirmingDelete(null);
            return;
        }

        setIsDeleting(id);
        try {
            await deleteFeedbackService(id);
            setMyFeedbacks(myFeedbacks.filter(f => f.id !== id));
            setConfirmingDelete(null);
        } catch (err) {
            alert('Errore durante la cancellazione. Verifica la connessione o i permessi.');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await submitFeedback({
                type,
                title,
                description,
                user_id: state.currentUser.id,
                user_name: state.currentUser.name
            });
            setIsSuccess(true);
            setTitle('');
            setDescription('');
            loadMyFeedbacks(); // Refresh history
        } catch (err) {
            setError('Si è verificato un errore durante l\'invio della segnalazione. Riprova più tardi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto mt-12 animate-fade-in">
                <Card className="text-center py-12">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle2 size={48} className="text-green-600" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-4">Segnalazione Inviata!</h2>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto">
                        Grazie per il tuo contributo. La tua segnalazione è stata registrata e verrà presa in carico dal team di sviluppo.
                    </p>
                    <button
                        onClick={() => setIsSuccess(false)}
                        className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition"
                    >
                        Invia un'altra segnalazione
                    </button>
                </Card>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div className="bg-gradient-to-r from-primary/10 to-blue-500/10 p-6 rounded-2xl border border-primary/20">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    <MessageSquare size={28} className="text-primary" />
                    Segnala un Bug o Suggerisci una Modifica
                </h1>
                <p className="text-slate-600 mt-2">
                    Aiutaci a migliorare l'applicazione segnalando problemi tecnici o suggerendo nuove funzionalità.
                    Le tue segnalazioni verranno visualizzate e gestite dagli amministratori di sistema.
                </p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            type="button"
                            onClick={() => setType(FeedbackType.BUG)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2
                                ${type === FeedbackType.BUG
                                    ? 'border-red-50 bg-red-50 text-red-700'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                        >
                            <Bug size={32} />
                            <span className="font-semibold">Bug / Errore</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setType(FeedbackType.FEATURE_REQUEST)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2
                                ${type === FeedbackType.FEATURE_REQUEST
                                    ? 'border-blue-50 bg-blue-50 text-blue-700'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                        >
                            <Lightbulb size={32} />
                            <span className="font-semibold">Nuova Funzione</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setType(FeedbackType.CHANGE_REQUEST)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-2
                                ${type === FeedbackType.CHANGE_REQUEST
                                    ? 'border-amber-50 bg-amber-50 text-amber-700'
                                    : 'border-slate-100 hover:border-slate-200 text-slate-500'}`}
                        >
                            <MessageSquare size={32} />
                            <span className="font-semibold">Modifica Dati</span>
                        </button>
                    </div>

                    <div className="space-y-4">
                        <Input
                            label="Titolo della segnalazione"
                            placeholder="Es: Errore nel calcolo del limite Art. 23"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Descrizione dettagliata
                            </label>
                            <textarea
                                className="w-full min-h-[150px] p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-slate-400"
                                placeholder="Descrivi il problema o la richiesta nel dettaglio..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting || !title.trim() || !description.trim()}
                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-dark transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                        >
                            {isSubmitting ? (
                                <>Invio in corso...</>
                            ) : (
                                <>
                                    <Send size={18} />
                                    Invia Segnalazione
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </Card>

            <div className="pt-8">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 mb-4">
                    <History size={24} className="text-slate-400" />
                    Le mie Segnalazioni
                </h2>

                {isLoadingHistory ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : myFeedbacks.length === 0 ? (
                    <Card className="bg-slate-50/50">
                        <p className="text-slate-500 text-center py-4 italic">Non hai ancora inviato segnalazioni.</p>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {myFeedbacks.map((f: AppFeedback) => (
                            <div key={f.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-primary/30 transition-colors">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className={`p-2 rounded-lg ${f.type === FeedbackType.BUG ? 'bg-red-50 text-red-600' :
                                        f.type === FeedbackType.FEATURE_REQUEST ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                                        }`}>
                                        {f.type === FeedbackType.BUG ? <Bug size={18} /> : f.type === FeedbackType.FEATURE_REQUEST ? <Lightbulb size={18} /> : <MessageSquare size={18} />}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-slate-900">{f.title}</h4>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-slate-400">{new Date(f.created_at).toLocaleDateString()}</span>
                                            <span className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${f.status === FeedbackStatus.OPEN ? 'text-amber-500' :
                                                f.status === FeedbackStatus.IN_PROGRESS ? 'text-blue-500' :
                                                    f.status === FeedbackStatus.RESOLVED ? 'text-green-500' : 'text-slate-400'
                                                }`}>
                                                {f.status === FeedbackStatus.OPEN && <Clock size={10} />}
                                                {f.status === FeedbackStatus.IN_PROGRESS && <AlertCircle size={10} />}
                                                {f.status === FeedbackStatus.RESOLVED && <CheckCircle2 size={10} />}
                                                {f.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {f.status === FeedbackStatus.OPEN && (
                                    <div className="flex items-center gap-2">
                                        {confirmingDelete === f.id ? (
                                            <div className="flex items-center gap-2 animate-fade-in bg-slate-50 p-1 rounded-lg border border-slate-100">
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setConfirmingDelete(null); }}
                                                    className="px-2 py-1 text-xs font-bold text-slate-500 hover:text-slate-700 transition"
                                                >
                                                    Annulla
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(f.id, f.status); }}
                                                    disabled={isDeleting === f.id}
                                                    className="px-2 py-1 text-xs font-bold bg-red-500 text-white rounded hover:bg-red-600 transition disabled:opacity-50"
                                                >
                                                    {isDeleting === f.id ? '...' : 'Elimina'}
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={(e) => { e.stopPropagation(); setConfirmingDelete(f.id); }}
                                                className="p-2 text-slate-300 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                                                title="Elimina segnalazione"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
