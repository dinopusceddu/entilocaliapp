import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAppContext } from '../contexts/AppContext';
import { AppMessage } from '../types/communications';
import { Mail, AlertCircle, CheckCircle } from 'lucide-react';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

export const MessagesPage: React.FC = () => {
    const { state } = useAppContext();
    const [messages, setMessages] = useState<AppMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMessages();
    }, [state.currentUser.id]);

    const fetchMessages = async () => {
        setLoading(true);
        setError(null);
        try {
            // RLS allows reading if user_id matches OR if user_id is null (broadcast)
            const { data, error: fetchErr } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchErr) throw fetchErr;

            // Optional: fetch read status from message_reads to highlight unread messages
            const { data: readsData } = await supabase
                .from('message_reads')
                .select('message_id')
                .eq('user_id', state.currentUser.id);

            const readIds = new Set(readsData?.map(r => r.message_id) || []);

            const enrichedMessages = (data || []).map(msg => ({
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

    const handleMarkAsRead = async (messageId: string) => {
        try {
            const { error } = await supabase.from('message_reads').insert({
                message_id: messageId,
                user_id: state.currentUser.id
            });
            // Ignore unique constraint violation if they click twice quickly
            if (error && error.code !== '23505') {
                console.error("Error marking as read", error);
            } else {
                setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_read: true } : m));
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center border-b border-[#f3e7e8] pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 rounded-lg text-primary">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-[#1b0e0e] text-2xl font-bold leading-tight">Bacheca Messaggi</h2>
                        <p className="text-[#5f5252] mt-1">Leggi le circolari e le comunicazioni inviate dall'amministratore.</p>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner text="Caricamento messaggi..." />
                </div>
            ) : (
                <div className="space-y-4">
                    {messages.length === 0 ? (
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-lg">Nessun messaggio nella tua bacheca.</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div
                                key={msg.id}
                                className={`bg-white rounded-xl shadow-sm border p-5 transition-all
                                    ${msg.is_read ? 'border-gray-200 opacity-80' : 'border-primary/40 shadow-md ring-1 ring-primary/10'}`
                                }
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className={`text-xl ${msg.is_read ? 'text-gray-800 font-medium' : 'text-gray-900 font-bold'}`}>
                                        {msg.title}
                                    </h3>
                                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                                        {new Date(msg.created_at).toLocaleDateString()} {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                    {msg.content}
                                </div>

                                {!msg.is_read && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                                        <button
                                            onClick={() => handleMarkAsRead(msg.id)}
                                            className="flex items-center gap-2 text-sm text-primary hover:text-red-700 font-medium px-3 py-1.5 rounded-full hover:bg-red-50 transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" /> Segna come letto
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
