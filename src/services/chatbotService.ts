import { supabase } from './supabase';
import { ChatResponse } from '../types/chat';

export const sendMessageToChatbot = async (
    message: string,
    contextData?: string
): Promise<ChatResponse> => {
    try {
        // Chiamata alla Supabase Edge Function 'chat-rag' (quella appena creata)
        const { data, error } = await supabase.functions.invoke('chat-rag', {
            body: {
                query: message,
                contextData
            }
        });

        if (error) {
            console.error('Supabase Edge Function Error:', error);
            throw new Error(`Errore dal servizio di chat: ${error.message}`);
        }

        return {
            answer: data?.answer || "Nessuna risposta dal server.",
            sources: data?.sources || []
        };
    } catch (error: any) {
        console.error('Error invoking chat function:', error);
        return {
            answer: "Mi scuso, si è verificato un errore durante la comunicazione con il server.",
            error: error.message
        };
    }
};
