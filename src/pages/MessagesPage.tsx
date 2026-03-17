import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAppContext } from '../contexts/AppContext';
import { AppMessage } from '../types/communications';
import { UserRole } from '../enums';
import { Mail, AlertCircle, CheckCircle, Send, Plus, Clock, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { Card } from '../components/shared/Card';
import { UserSearchSelect } from '../components/shared/UserSearchSelect';

export const MessagesPage: React.FC = () => {
    const { state } = useAppContext();
    const { currentUser } = state;
    const [messages, setMessages] = useState<AppMessage[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Admin Form States
    const [msgTitle, setMsgTitle] = useState('');
    const [msgContent, setMsgContent] = useState('');
    const [msgUserId, setMsgUserId] = useState<string>('all');
    const [isSending, setIsSending] = useState(false);

    const isAdmin = currentUser.role === UserRole.ADMIN;

    useEffect(() => {
        fetchMessages();
        if (isAdmin) {
            fetchUsers();
        }
    }, [state.currentUser.id, isAdmin]);

    const fetchUsers = async () => {
        try {
            const { data, error: usersErr } = await supabase
                .from('profiles')
                .select('id, email')
                .order('email');
            
            if (usersErr) throw usersErr;
            setUsers(data || []);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchMessages = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fetchErr } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchErr) throw fetchErr;

            const { data: readsData } = await supabase
                .from('message_reads')
                .select('message_id')
                .eq('user_id', state.currentUser.id);

            const readIds = new Set(readsData?.map((r: { message_id: string }) => r.message_id) || []);

            const enrichedMessages = (data || []).map((msg: any) => ({
                ...msg,
                is_read: readIds.has(msg.id)
            }));

            setMessages(enrichedMessages);
        } catch (err: any) {
            console.error('Error fetching messages:', err);
            setError(err.message || 'Impossibile caricare i messaggi.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        setError(null);
        setSuccess(null);

        try {
            const { error } = await supabase.from('messages').insert({
                title: msgTitle,
                content: msgContent,
                user_id: msgUserId === 'all' ? null : msgUserId,
                author_id: currentUser.id
            });

            if (error) throw error;
            
            setSuccess('Messaggio inviato con successo!');
            setMsgTitle('');
            setMsgContent('');
            setMsgUserId('all');
            fetchMessages();
        } catch (err: any) {
            console.error('Error sending message:', err);
            setError(err.message || "Errore durante l'invio del messaggio.");
        } finally {
            setIsSending(false);
        }
    };

    const handleMarkAsRead = async (messageId: string) => {
        try {
            const { error } = await supabase.from('message_reads').insert({
                message_id: messageId,
                user_id: state.currentUser.id
            });
            if (error && error.code !== '23505') throw error;
            setMessages((prev: AppMessage[]) => prev.map((m: AppMessage) => m.id === messageId ? { ...m, is_read: true } : m));
        } catch (e) {
            console.error(e);
        }
    };

    const handleDeleteMessage = async (id: string) => {
        if (!confirm('Vuoi davvero eliminare questo messaggio per tutti?')) return;
        try {
            const { error } = await supabase.from('messages').delete().eq('id', id);
            if (error) throw error;
            setMessages((prev: AppMessage[]) => prev.filter((m: AppMessage) => m.id !== id));
            setSuccess('Messaggio eliminato.');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#f3e7e8] pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-red-50 rounded-2xl text-primary">
                        <Mail className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-[#1b0e0e] text-3xl font-bold tracking-tight">Bacheca Messaggi</h2>
                        <p className="text-[#5f5252] mt-1">Leggi le circolari e le comunicazioni inviate dall'amministratore.</p>
                    </div>
                </div>
                {isAdmin && (
                    <Button onClick={() => setMsgUserId('admin-form')} variant="primary" className="shadow-lg shadow-primary/20">
                        <Plus className="w-4 h-4 mr-2" /> Nuovo Messaggio
                    </Button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center animate-in slide-in-from-top-2">
                    <AlertCircle className="w-6 h-6 mr-3 shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl flex items-center animate-in slide-in-from-top-2">
                    <CheckCircle className="w-6 h-6 mr-3 shrink-0" />
                    {success}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <LoadingSpinner text="Caricamento messaggi..." />
                        </div>
                    ) : messages.length === 0 ? (
                        <Card className="p-12 text-center border-dashed border-2 border-slate-200">
                            <Mail className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <p className="text-slate-500 text-lg font-medium">Nessun messaggio nella tua bacheca.</p>
                        </Card>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg: AppMessage) => (
                                <Card 
                                    key={msg.id}
                                    className={`p-6 transition-all hover:shadow-md border-l-4 ${
                                        msg.is_read ? 'border-l-slate-200 opacity-80' : 'border-l-primary shadow-sm bg-primary/5'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            {!msg.is_read && (
                                                <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(234,40,50,0.5)]"></span>
                                            )}
                                            <h3 className={`text-xl transition-all ${msg.is_read ? 'text-slate-800 font-bold' : 'text-slate-900 font-extrabold'}`}>
                                                {msg.title}
                                            </h3>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-xs">
                                                {new Date(msg.created_at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-slate-700 whitespace-pre-wrap leading-relaxed mb-6 italic">
                                        {msg.content}
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                        <div className="flex gap-4">
                                            {!msg.is_read && (
                                                <button
                                                    onClick={() => handleMarkAsRead(msg.id)}
                                                    className="flex items-center gap-2 text-sm text-primary hover:text-red-700 font-bold px-3 py-1.5 rounded-full hover:bg-white transition-all shadow-sm border border-primary/20"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Segna come letto
                                                </button>
                                            )}
                                            {msg.user_id && isAdmin && (
                                                <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase self-center">Mirato</span>
                                            )}
                                            {!msg.user_id && isAdmin && (
                                                <span className="px-2 py-1 bg-purple-50 text-purple-600 text-[10px] font-bold rounded uppercase self-center">Circolare</span>
                                            )}
                                        </div>

                                        {isAdmin && (
                                            <button
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Elimina per tutti"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {isAdmin && (
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="sticky top-24 border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <div className="bg-gradient-to-br from-red-900 to-primary p-6 text-white">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Send className="w-5 h-5 text-red-200" />
                                    Nuova Circolare
                                </h3>
                                <p className="text-red-100/70 text-sm mt-1">Invia messaggi importanti agli utenti.</p>
                            </div>

                            <form onSubmit={handleSendMessage} className="p-6 space-y-5 bg-white">
                                <UserSearchSelect
                                    label="Destinatario"
                                    users={users}
                                    selectedUserId={msgUserId}
                                    onSelect={(id: string) => setMsgUserId(id)}
                                />

                                <Input
                                    label="Oggetto / Titolo"
                                    type="text"
                                    value={msgTitle}
                                    onChange={(e) => setMsgTitle(e.target.value)}
                                    placeholder="Es: Aggiornamento CCNL"
                                    required
                                    inputClassName="bg-slate-50"
                                />

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-slate-700">Contenuto Messaggio</label>
                                    <textarea
                                        value={msgContent}
                                        onChange={(e) => setMsgContent(e.target.value)}
                                        className="w-full rounded-xl border-slate-200 shadow-sm focus:border-primary focus:ring-primary focus:ring-opacity-20 sm:text-sm p-3 border bg-slate-50 min-h-[150px] resize-none transition-all placeholder:text-slate-400"
                                        placeholder="Scrivi qui il corpo del messaggio..."
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                                    isLoading={isSending}
                                >
                                    Invia Ora
                                </Button>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};
