import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Loader2 } from 'lucide-react';
import { Message } from '../../types/chat';
import { ChatMessage } from './ChatMessage';
import { sendMessageToChatbot } from '../../services/chatbotService';
import { useAppContext } from '../../contexts/AppContext';

interface ChatWindowProps {
    onClose: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ onClose }) => {
    const { state } = useAppContext();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Ciao! Sono l\'assistente virtuale. Come posso aiutarti con il fondo accessorio e la normazione?',
            createdAt: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            createdAt: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            // Prepara i dati di contesto dell'ente utente
            const { currentEntity, currentYear, fundData } = state;

            let contextData = "Dati Ente non disponibili.";
            if (currentEntity && fundData) {
                // Calcoliamo i totali al volo per il contesto, se disponibili
                const totaleRisorse = state.calculatedFund?.totaleFondo || 0;
                const limite2016 = state.calculatedFund?.ammontareSoggettoLimite2016 || 0;
                const fondoBaseStorico2016 = state.calculatedFund?.fondoBase2016 || 0;

                contextData = `
DATI SPECIFICI DELL'ENTE DELL'UTENTE:
- Nome Ente: ${currentEntity.name}
- Anno di riferimento dati: ${currentYear}
- Importo storico del fondo accessorio per l'anno 2016 (Fondo Base Storico 2016): € ${fondoBaseStorico2016.toFixed(2)}
- Totale Risorse Costituzione Fondo dell'anno in corso (calcolato): € ${totaleRisorse.toFixed(2)}
- Risorse soggette al Limite 2016 dell'anno in corso (calcolato): € ${limite2016.toFixed(2)}
- Consistenza Personale Anno Rif: ${fundData.annualData?.personaleAnnoRifPerArt23?.length || 0}
- Consistenza Personale 2018: ${fundData.annualData?.personale2018PerArt23?.length || 0}
`;
            }

            // Invia il messaggio al servizio backend, includendo il contesto utente
            const response = await sendMessageToChatbot(userMessage.content, contextData);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.answer,
                createdAt: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);

        } catch (error) {
            console.error("Errore durante l'invio al chatbot", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'system',
                content: 'Si è verificato un errore di connessione con l\'assistente. Riprova più tardi.',
                createdAt: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
                <div>
                    <h3 className="font-semibold text-lg">Aiuto & Supporto</h3>
                    <p className="text-blue-100 text-xs">Assistente Virtuale RAG</p>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-blue-700 rounded-full transition-colors"
                    aria-label="Chiudi chat"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-2">
                {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                ))}
                {isLoading && (
                    <div className="flex w-full mt-4 space-x-3 max-w-sm">
                        <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
                        </div>
                        <div>
                            <div className="p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                                <div className="flex space-x-1 items-center h-5">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t">
                <form onSubmit={handleSend} className="flex space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Scrivi qui la tua domanda..."
                        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};
