import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Card } from '../components/shared/Card';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { FundData, CalculatedFund } from '../types';
import { formatCurrency } from '../utils/formatters';
import { sendMessageToChatbot } from '../services/chatbotService';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string | React.ReactNode;
  timestamp: Date;
}

const formatCurrencyForContext = (value?: number, defaultValue = "non specificato"): string => {
  return formatCurrency(value, defaultValue);
};

const generateContextFromState = (fundData: FundData, calculatedFund?: CalculatedFund): string => {
  let context = `CONTESTO DATI FONDO DA CONSIDERARE:\n`;
  context += `Anno Riferimento: ${fundData.annualData.annoRiferimento}\n`;
  context += `Ente: ${fundData.annualData.denominazioneEnte || 'Non specificato'}\n`;
  context += `Ente con Dirigenza: ${fundData.annualData.hasDirigenza ? 'Sì' : 'No'}\n\n`;

  if (calculatedFund) {
    const { dettaglioFondi } = calculatedFund;
    context += "SINTESI FONDI CALCOLATI:\n";
    context += `  - Totale Fondo Personale Dipendente: ${formatCurrencyForContext(dettaglioFondi.dipendente.totale)}\n`;
    context += `  - Totale Fondo Elevate Qualificazioni: ${formatCurrencyForContext(dettaglioFondi.eq.totale)}\n`;
    context += `  - Totale Risorse Segretario Comunale: ${formatCurrencyForContext(dettaglioFondi.segretario.totale)}\n`;
    if (fundData.annualData.hasDirigenza) {
      context += `  - Totale Fondo Dirigenza: ${formatCurrencyForContext(dettaglioFondi.dirigenza.totale)}\n`;
    }
    context += `\n`;
    context += "CALCOLO GLOBALE FONDO:\n";
    context += `- Totale Generale Risorse Decentrate: ${formatCurrencyForContext(calculatedFund.totaleFondoRisorseDecentrate)}\n`;
    context += `- Superamento Limite 2016 (Globale): ${calculatedFund.superamentoLimite2016 ? formatCurrencyForContext(calculatedFund.superamentoLimite2016) : 'Nessuno'}\n\n`;
  } else {
    context += "RISULTATI CALCOLO FONDO NON DISPONIBILI. Eseguire prima il calcolo nel applicativo.\n\n";
  }

  return context;
};

export const ChecklistPage: React.FC = () => {
  const { state } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: 'Ciao! Sono l\'assistente virtuale. Usa questo spazio per farmi domande sul regolamento e io ti risponderò considerando anche i dati che hai inserito in questo Fondo.',
      timestamp: new Date(),
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userInput,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      // 1. Genera il test di contesto leggero
      const context = generateContextFromState(state.fundData, state.calculatedFund);

      // 2. Unisci il contesto alla domanda in formato speciale per la Edge Function
      // L'Edge function si aspetta solo 'query', quindi mettiamo tutto lì dentro per ora
      const finalPrompt = `DOMANDA DELL'UTENTE: ${userMessage.text}\n\n${context}`;

      // 3. Invia alla Edge Function via servizio centralizzato
      const response = await sendMessageToChatbot(finalPrompt);

      if (response.error) {
        throw new Error(response.error);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.answer,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (e) {
      console.error("Errore chat:", e);
      const errorMessage = e instanceof Error ? e.message : "Errore sconosciuto";
      setError(`Si è verificato un errore: ${errorMessage}`);
      const botErrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Mi dispiace, non sono riuscito a elaborare la tua richiesta in questo momento.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-[#1b0e0e] tracking-light text-2xl sm:text-[30px] font-bold leading-tight">Chiedi informazioni</h2>

      <Card title="Assistente Contesto Progetto" className="flex flex-col h-[calc(100vh-250px)] max-h-[700px]">
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#fcf8f8]">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-3 rounded-xl shadow ${msg.sender === 'user'
                ? 'bg-[#ea2832] text-white'
                : 'bg-white text-[#1b0e0e] border border-[#f3e7e8]'
                }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-gray-200' : 'text-[#5f5252]'} text-opacity-80`}>
                  {msg.timestamp.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-lg shadow bg-white text-[#1b0e0e] border border-[#f3e7e8]">
                <LoadingSpinner size="sm" text="L'assistente sta pensando..." textColor="text-[#5f5252]" />
              </div>
            </div>
          )}
          {error && (
            <div className="flex justify-start">
              <div className="max-w-[70%] p-3 rounded-lg shadow bg-[#fef2f2] text-[#991b1b] border border-[#fecaca]">
                <p className="text-sm font-semibold">Errore:</p>
                <p className="text-sm whitespace-pre-wrap">{error}</p>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-[#f3e7e8] bg-white">
          <div className="flex items-center space-x-3">
            <textarea
              rows={2}
              className="form-textarea flex-grow resize-none rounded-lg text-[#1b0e0e] border-none bg-[#f3e7e8] placeholder:text-[#994d51] p-3 focus:ring-2 focus:ring-[#ea2832]/50 focus:outline-none"
              placeholder="Scrivi la tua domanda qui..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              disabled={isLoading}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !userInput.trim()} variant="primary" size="md">
              {isLoading ? "Inviando..." : "Invia"}
            </Button>
          </div>
        </div>
      </Card>
      <Card title="Suggerimenti per le domande" className="mt-4" isCollapsible defaultCollapsed={true}>
        <ul className="list-disc list-inside text-sm text-[#5f5252] space-y-1 p-2">
          <li>"Sulla base del manuale e dei miei inserimenti, c'è un'incongruenza sui tetti del premio performance?"</li>
          <li>"Cosa dice il regolamento sulle risorse stabili per la dirigenza considerando il mio ente?"</li>
          <li>"Ricapitolami i vincoli di legge per la composizione del fondo."</li>
        </ul>
        <p className="text-xs text-[#5f5252] mt-2 p-2">
          L'assistente risponderà incrociando il Knowledge Base (Regolamento) con i <strong>tuoi dati calcolati</strong>.
        </p>
      </Card>
    </div>
  );
};
