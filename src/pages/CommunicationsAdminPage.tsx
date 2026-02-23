import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAppContext } from '../contexts/AppContext';
import { UserRole } from '../enums';
import { AppMessage, AppNotification } from '../types/communications';
import { AlertCircle, Send, CheckCircle, Trash2, Bell, Mail } from 'lucide-react';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

export const CommunicationsAdminPage: React.FC = () => {
    const { state } = useAppContext();
    const [messages, setMessages] = useState<AppMessage[]>([]);
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form States
    const [activeTab, setActiveTab] = useState<'messages' | 'notifications'>('messages');

    // Message Form
    const [msgTitle, setMsgTitle] = useState('');
    const [msgContent, setMsgContent] = useState('');
    const [msgUserId, setMsgUserId] = useState<string>('all'); // 'all' or UUID
    const [isSendingMsg, setIsSendingMsg] = useState(false);

    // Notification Form
    const [notifTitle, setNotifTitle] = useState('');
    const [notifMessage, setNotifMessage] = useState('');
    const [notifLink, setNotifLink] = useState('');
    const [isSendingNotif, setIsSendingNotif] = useState(false);

    useEffect(() => {
        if (state.currentUser.role === UserRole.ADMIN) {
            fetchData();
        }
    }, [state.currentUser.role]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch messages
            const { data: msgs, error: msgsErr } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            if (msgsErr) throw msgsErr;

            // Fetch notifications
            const { data: notifs, error: notifsErr } = await supabase
                .from('notifications')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);
            if (notifsErr) throw notifsErr;

            // Fetch users for the dropdown
            const { data: usersData, error: usersErr } = await supabase
                .from('user_app_state')
                .select('user_id, email');
            if (usersErr) throw usersErr;

            // Deduplicate users
            const uniqueUsers = Array.from(new Map(usersData.map(item => [item.user_id, item])).values());

            setMessages(msgs || []);
            setNotifications(notifs || []);
            setUsers(uniqueUsers);
        } catch (err: any) {
            console.error('Error fetching communications:', err);
            setError(err.message || 'Errore nel caricamento dei dati.');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSendingMsg(true);
        setError(null);
        setSuccess(null);

        try {
            const { error } = await supabase.from('messages').insert({
                title: msgTitle,
                content: msgContent,
                user_id: msgUserId === 'all' ? null : msgUserId,
                author_id: state.currentUser.id
            });

            if (error) throw error;
            setSuccess('Messaggio inviato con successo!');
            setMsgTitle('');
            setMsgContent('');
            setMsgUserId('all');
            fetchData();
        } catch (err: any) {
            console.error('Error sending message:', err);
            setError(err.message || 'Errore durante l\'invio del messaggio.');
        } finally {
            setIsSendingMsg(false);
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
                link: notifLink || null,
                author_id: state.currentUser.id
            });

            if (error) throw error;
            setSuccess('Notifica globale inviata con successo!');
            setNotifTitle('');
            setNotifMessage('');
            setNotifLink('');
            fetchData();
        } catch (err: any) {
            console.error('Error sending notification:', err);
            setError(err.message || 'Errore durante l\'invio della notifica.');
        } finally {
            setIsSendingNotif(false);
        }
    };

    const handleDeleteMessage = async (id: string) => {
        if (!confirm('Vuoi davvero eliminare questo messaggio?')) return;
        try {
            const { error } = await supabase.from('messages').delete().eq('id', id);
            if (error) throw error;
            setMessages(messages.filter(m => m.id !== id));
            setSuccess('Messaggio eliminato.');
        } catch (err: any) {
            setError(err.message);
        }
    };

    const handleDeleteNotification = async (id: string) => {
        if (!confirm('Vuoi davvero eliminare questa notifica?')) return;
        try {
            const { error } = await supabase.from('notifications').delete().eq('id', id);
            if (error) throw error;
            setNotifications(notifications.filter(n => n.id !== id));
            setSuccess('Notifica eliminata.');
        } catch (err: any) {
            setError(err.message);
        }
    };

    if (state.currentUser.role !== UserRole.ADMIN) {
        return (
            <div className="flex justify-center items-center h-full text-red-600">
                <AlertCircle className="mr-2" />
                Accesso Negato. Solo gli amministratori possono visualizzare questa pagina.
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center border-b border-[#f3e7e8] pb-4">
                <div>
                    <h2 className="text-[#1b0e0e] text-2xl font-bold leading-tight">Gestione Comunicazioni</h2>
                    <p className="text-[#5f5252] mt-1">Invia messaggi in bacheca e notifiche globali.</p>
                </div>
                <Button onClick={fetchData} variant="secondary" size="sm">
                    Aggiorna
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 shrink-0" />
                    {success}
                </div>
            )}

            <div className="flex border-b border-gray-200">
                <button
                    className={`py-3 px-6 text-sm font-medium border-b-2 flex items-center ${activeTab === 'messages' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('messages')}
                >
                    <Mail className="w-4 h-4 mr-2" />
                    Messaggi
                </button>
                <button
                    className={`py-3 px-6 text-sm font-medium border-b-2 flex items-center ${activeTab === 'notifications' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    onClick={() => setActiveTab('notifications')}
                >
                    <Bell className="w-4 h-4 mr-2" />
                    Notifiche
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner text="Caricamento..." />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                    {/* Form Section */}
                    <div className="lg:col-span-1 border-r border-gray-200 pr-6">
                        {activeTab === 'messages' && (
                            <form onSubmit={handleSendMessage} className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuovo Messaggio</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Destinatario</label>
                                    <select
                                        value={msgUserId}
                                        onChange={(e) => setMsgUserId(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm bg-white p-2 border"
                                    >
                                        <option value="all">Tutti gli utenti (Globale)</option>
                                        {users.map(u => (
                                            <option key={u.user_id} value={u.user_id}>{u.email}</option>
                                        ))}
                                    </select>
                                </div>
                                <Input
                                    label="Titolo"
                                    type="text"
                                    value={msgTitle}
                                    onChange={(e) => setMsgTitle(e.target.value)}
                                    placeholder="Oggetto del messaggio"
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contenuto</label>
                                    <textarea
                                        value={msgContent}
                                        onChange={(e) => setMsgContent(e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border min-h-[150px]"
                                        placeholder="Testo del messaggio..."
                                        required
                                    />
                                </div>
                                <Button type="submit" variant="primary" className="w-full" isLoading={isSendingMsg}>
                                    <Send className="w-4 h-4 mr-2" /> Invia Messaggio
                                </Button>
                            </form>
                        )}

                        {activeTab === 'notifications' && (
                            <form onSubmit={handleSendNotification} className="space-y-4">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Nuova Notifica Globale</h3>
                                <p className="text-sm text-gray-500 mb-4">Le notifiche sono avvisi brevi che compaiono a tutti gli utenti sotto l'icona della campanella.</p>
                                <Input
                                    label="Titolo Breve"
                                    type="text"
                                    value={notifTitle}
                                    onChange={(e) => setNotifTitle(e.target.value)}
                                    placeholder="Es: Aggiornamento Sistema"
                                    maxLength={50}
                                    required
                                />
                                <Input
                                    label="Testo"
                                    type="text"
                                    value={notifMessage}
                                    onChange={(e) => setNotifMessage(e.target.value)}
                                    placeholder="Inserisci il testo della notifica..."
                                    maxLength={255}
                                    required
                                />
                                <Input
                                    label="Link Opzionale (URL)"
                                    type="url"
                                    value={notifLink}
                                    onChange={(e) => setNotifLink(e.target.value)}
                                    placeholder="https://"
                                />
                                <Button type="submit" variant="primary" className="w-full" isLoading={isSendingNotif}>
                                    <Send className="w-4 h-4 mr-2" /> Invia Notifica
                                </Button>
                            </form>
                        )}
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-2 space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Storico {activeTab === 'messages' ? 'Messaggi' : 'Notifiche'} Inviati
                        </h3>

                        {activeTab === 'messages' && messages.length === 0 && (
                            <p className="text-gray-500 italic">Nessun messaggio trovato.</p>
                        )}
                        {activeTab === 'messages' && messages.map(msg => (
                            <div key={msg.id} className="bg-white border rounded-lg p-4 shadow-sm relative pr-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`text-xs px-2 py-1 rounded-full ${msg.user_id ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                        {msg.user_id ? 'Utente Specifico' : 'Globale'}
                                    </span>
                                    <span className="text-xs text-gray-500">{new Date(msg.created_at).toLocaleString()}</span>
                                </div>
                                <h4 className="font-bold text-gray-900">{msg.title}</h4>
                                <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{msg.content}</p>

                                <button
                                    onClick={() => handleDeleteMessage(msg.id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
                                    title="Elimina"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}

                        {activeTab === 'notifications' && notifications.length === 0 && (
                            <p className="text-gray-500 italic">Nessuna notifica trovata.</p>
                        )}
                        {activeTab === 'notifications' && notifications.map(notif => (
                            <div key={notif.id} className="bg-white border rounded-lg p-4 shadow-sm relative pr-10">
                                <div className="text-xs text-gray-500 mb-1">{new Date(notif.created_at).toLocaleString()}</div>
                                <h4 className="font-bold text-gray-900">{notif.title}</h4>
                                <p className="text-sm text-gray-700 mt-1">{notif.message}</p>
                                {notif.link && (
                                    <a href={notif.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
                                        Link correlato
                                    </a>
                                )}

                                <button
                                    onClick={() => handleDeleteNotification(notif.id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-600"
                                    title="Elimina"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
