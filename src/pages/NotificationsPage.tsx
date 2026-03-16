import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../enums';
import { AppNotification } from '../types/communications';
import { Bell, AlertCircle, Send, CheckCircle, Trash2, Filter, Clock } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Card } from '../components/shared/Card';

export const NotificationsPage: React.FC = () => {
    const { state } = useAppContext();
    const { currentUser } = state;
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filter states
    const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

    // Admin Form States
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');
    const [notifUserId, setNotifUserId] = useState<string>('all'); // 'all' or UUID
    const [notifLink, setNotifLink] = useState('');
    const [isSendingNotif, setIsSendingNotif] = useState(false);

    const isAdmin = currentUser.role === UserRole.ADMIN;

    useEffect(() => {
        fetchNotifications();
        if (isAdmin) {
            fetchUsers();
        }
    }, [currentUser.id, isAdmin]);

    const fetchUsers = async () => {
        try {
            const { data, error: usersErr } = await supabase
                .from('user_app_state')
                .select('user_id, email');
            if (usersErr) throw usersErr;
            // Deduplicate users
            const uniqueUsers = Array.from(new Map(data.map(item => [item.user_id, item])).values());
            setUsers(uniqueUsers);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch notifications (RLS handles filtering by user_id/broadcast)
            const { data: notifs, error: notifsErr } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false });

            if (notifsErr) throw notifsErr;

            // Fetch read status
            const { data: readsData, error: readsErr } = await supabase
                .from('notification_reads')
                .select('notification_id')
                .eq('user_id', currentUser.id);

            if (readsErr) throw readsErr;

            const readIds = new Set(readsData?.map(r => r.notification_id) || []);

            const enrichedNotifs = (notifs || []).map(n => ({
                ...n,
                is_read: readIds.has(n.id)
            }));

            setNotifications(enrichedNotifs);
        } catch (err: any) {
            console.error('Error fetching notifications:', err);
            setError(err.message || 'Errore nel caricamento delle notifiche.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            const { error } = await supabase.from('notification_reads').insert({
                notification_id: id,
                user_id: currentUser.id
            });
            if (error && error.code !== '23505') throw error;
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const handleSendNotification = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSendingNotif(true);
        setError(null);
        setSuccess(null);

        try {
            const { error } = await supabase.from('notifications').insert({
                title: notifTitle,
                message: notifMessage,
                user_id: notifUserId === 'all' ? null : notifUserId,
                link: notifLink || null,
                author_id: currentUser.id
            });

            if (error) throw error;
            setSuccess('Notifica inviata con successo!');
            setNotifTitle('');
            setNotifMessage('');
            setNotifUserId('all');
            setNotifLink('');
            fetchNotifications();
        } catch (err: any) {
            console.error('Error sending notification:', err);
            setError(err.message || 'Errore durante l\'invio della notifica.');
        } finally {
            setIsSendingNotif(false);
        }
    };

    const handleDeleteNotification = async (id: string) => {
        if (!confirm('Vuoi davvero eliminare questa notifica?')) return;
        try {
            const { error } = await supabase.from('notifications').delete().eq('id', id);
            if (error) throw error;
            setNotifications(prev => prev.filter(n => n.id !== id));
            setSuccess('Notifica eliminata.');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const filteredNotifs = notifications.filter(n => {
        if (filter === 'unread') return !n.is_read;
        if (filter === 'read') return n.is_read;
        return true;
    });

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#f3e7e8] pb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                        <Bell className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-[#1b0e0e] text-3xl font-bold tracking-tight">Centro Notifiche</h2>
                        <p className="text-[#5f5252] mt-1">Gestisci e visualizza gli avvisi e le comunicazioni rapide.</p>
                    </div>
                </div>
                {isAdmin && (
                    <Button onClick={() => setNotifUserId('admin-form')} variant="primary" className="shadow-lg shadow-primary/20">
                        <Send className="w-4 h-4 mr-2" /> Invia Nuova Notifica
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
                {/* Main List Section */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-0 overflow-hidden border-none shadow-xl shadow-slate-200/50">
                        <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-slate-600 font-semibold">
                                <Filter className="w-4 h-4" />
                                <span>Filtra per stato</span>
                            </div>
                            <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                                {(['all', 'unread', 'read'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === f
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        {f === 'all' ? 'Tutte' : f === 'unread' ? 'Non lette' : 'Lette'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="divide-y divide-slate-100 min-h-[400px]">
                            {loading ? (
                                <div className="flex justify-center items-center py-20">
                                    <LoadingSpinner text="Caricamento notifiche..." />
                                </div>
                            ) : filteredNotifs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                                    <Bell className="w-16 h-16 mb-4 opacity-20" />
                                    <p className="text-lg font-medium">Nessuna notifica trovata.</p>
                                </div>
                            ) : (
                                filteredNotifs.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`p-6 transition-colors hover:bg-slate-50/50 relative group ${!notif.is_read ? 'bg-primary/5' : ''
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                {!notif.is_read && (
                                                    <span className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(234,40,50,0.5)]"></span>
                                                )}
                                                <h4 className={`text-lg transition-all ${!notif.is_read ? 'text-slate-900 font-bold' : 'text-slate-600 font-medium'}`}>
                                                    {notif.title}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Clock className="w-3.5 h-3.5" />
                                                <span className="text-xs">
                                                    {new Date(notif.created_at).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-slate-700 leading-relaxed mb-4">{notif.message}</p>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {notif.link && (
                                                    <a
                                                        href={notif.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-sm font-semibold text-primary hover:underline gap-1 group/link"
                                                    >
                                                        Vedi dettagli
                                                        <span className="transition-transform group-hover/link:translate-x-0.5">→</span>
                                                    </a>
                                                )}
                                                {!notif.is_read && (
                                                    <button
                                                        onClick={() => handleMarkAsRead(notif.id)}
                                                        className="text-sm font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                        Segna come letta
                                                    </button>
                                                )}
                                            </div>

                                            {isAdmin && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleDeleteNotification(notif.id)}
                                                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Elimina notifica"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {isAdmin && notif.user_id && (
                                            <div className="mt-3 inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                                Mirata a utente specifico
                                            </div>
                                        )}
                                        {isAdmin && !notif.user_id && (
                                            <div className="mt-3 inline-block px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                                Broadcasting Globale
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>
                </div>

                {/* Admin Side Section */}
                {isAdmin && (
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="sticky top-24 border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-white">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Send className="w-5 h-5 text-primary" />
                                    Invia Notifica
                                </h3>
                                <p className="text-slate-400 text-sm mt-1">Comunica istantaneamente con gli utenti.</p>
                            </div>

                            <form onSubmit={handleSendNotification} className="p-6 space-y-5 bg-white">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-slate-700">Destinatario</label>
                                    <select
                                        value={notifUserId}
                                        onChange={(e) => setNotifUserId(e.target.value)}
                                        className="w-full rounded-xl border-slate-200 shadow-sm focus:border-primary focus:ring-primary focus:ring-opacity-20 sm:text-sm bg-slate-50 p-3 border transition-all"
                                    >
                                        <option value="all">📢 Tutti gli utenti (Globale)</option>
                                        <optgroup label="Utenti Registrati">
                                            {users.map(u => (
                                                <option key={u.user_id} value={u.user_id}>👤 {u.email}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>

                                <Input
                                    label="Titolo"
                                    type="text"
                                    value={notifTitle}
                                    onChange={(e) => setNotifTitle(e.target.value)}
                                    placeholder="Es: Riorganizzazione Fondi"
                                    maxLength={50}
                                    required
                                    inputClassName="bg-slate-50"
                                />

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-slate-700">Testo Notifica</label>
                                    <textarea
                                        value={notifMessage}
                                        onChange={(e) => setNotifMessage(e.target.value)}
                                        className="w-full rounded-xl border-slate-200 shadow-sm focus:border-primary focus:ring-primary focus:ring-opacity-20 sm:text-sm p-3 border bg-slate-50 min-h-[100px] resize-none transition-all placeholder:text-slate-400"
                                        placeholder="Scrivi qui il messaggio..."
                                        maxLength={255}
                                        required
                                    />
                                </div>

                                <Input
                                    label="Link Opzionale"
                                    type="url"
                                    value={notifLink}
                                    onChange={(e) => setNotifLink(e.target.value)}
                                    placeholder="https://..."
                                    inputClassName="bg-slate-50"
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20"
                                    isLoading={isSendingNotif}
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
