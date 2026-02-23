import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../services/supabase';
import { Button } from '../shared/Button';
import { AlertCircle, CheckCircle, FileText, Trash2, Upload } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
// Configura il worker per pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface KnowledgeDocument {
    id: string;
    filename: string;
    created_at: string;
}

export const RagDocumentManager: React.FC = () => {
    const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Stato per il caricamento
    const [uploadProgress, setUploadProgress] = useState<{ current: number, total: number, status: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('knowledge_documents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setDocuments(data || []);
        } catch (err: any) {
            console.error("Errore fetch documenti:", err);
            setError("Impossibile caricare la lista dei documenti.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const chunkText = (text: string, maxChunkLength: number = 2000): string[] => {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const chunks: string[] = [];
        let currentChunk = '';

        for (const sentence of sentences) {
            if ((currentChunk + sentence).length > maxChunkLength) {
                if (currentChunk.trim().length > 0) {
                    chunks.push(currentChunk.trim());
                }
                currentChunk = sentence;
            } else {
                currentChunk += sentence;
            }
        }
        if (currentChunk.trim().length > 0) {
            chunks.push(currentChunk.trim());
        }

        // Fallback: se le frasi sono troppo lunghe
        if (chunks.length === 0 && text.length > 0) {
            for (let i = 0; i < text.length; i += maxChunkLength) {
                chunks.push(text.substring(i, i + maxChunkLength));
            }
        }
        return chunks;
    };

    const extractTextFromPdf = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n\n';
        }
        return fullText;
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setError(null);
        setSuccessMessage(null);
        setUploadProgress({ current: 0, total: 100, status: 'Lettura file in corso...' });

        try {
            let extractedText = '';

            if (file.type === 'application/pdf') {
                extractedText = await extractTextFromPdf(file);
            } else if (file.type === 'text/plain') {
                extractedText = await file.text();
            } else {
                throw new Error("Formato non supportato. Carica PDF o TXT.");
            }

            if (!extractedText || extractedText.trim().length === 0) {
                throw new Error("Il documento sembra vuoto o non estraibile.");
            }

            setUploadProgress({ current: 0, total: 100, status: 'Analisi testo quasi completata...' });
            const chunks = chunkText(extractedText);

            // 1. Crea il record in knowledge_documents
            const { data: docData, error: docError } = await supabase
                .from('knowledge_documents')
                .insert([{ filename: file.name }])
                .select()
                .single();

            if (docError) throw docError;
            const documentId = docData.id;

            setUploadProgress({ current: 0, total: chunks.length, status: 'Inizio caricamento nel database vettoriale...' });

            // 2. Processa ed inserisci i chunk tramite la Edge Function
            let successCount = 0;
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const { error: fnError } = await supabase.functions.invoke('process-rag-chunk', {
                    body: {
                        content: chunk,
                        document_id: documentId,
                        metadata: { source: file.name, part: i + 1, total_parts: chunks.length }
                    }
                });

                if (fnError) {
                    console.error(`Errore chunk ${i + 1}:`, fnError);
                    // Continuiamo con i prossimi anche se uno fallisce, ma potremmo fermarci
                } else {
                    successCount++;
                }

                setUploadProgress({ current: i + 1, total: chunks.length, status: `Caricamento... ${i + 1}/${chunks.length}` });
            }

            if (successCount === 0) {
                // Fallimento totale, cancella il doc
                await supabase.from('knowledge_documents').delete().eq('id', documentId);
                throw new Error("Nessun frammento è stato salvato correttamente. Verifica le API Key.");
            }

            setSuccessMessage(`Documento caricato! Elaborati ${successCount} frammenti su ${chunks.length}.`);
            fetchDocuments();

        } catch (err: any) {
            console.error("Errore upload:", err);
            setError(err.message || "Errore durante il caricamento del documento.");
        } finally {
            setUploadProgress(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDelete = async (id: string, filename: string) => {
        if (!confirm(`Vuoi davvero eliminare il documento "${filename}" e tutte le sue conoscenze?`)) return;

        try {
            const { error } = await supabase.from('knowledge_documents').delete().eq('id', id);
            if (error) throw error;
            setSuccessMessage(`Documento eliminato con successo.`);
            fetchDocuments();
        } catch (err: any) {
            console.error("Errore eliminazione:", err);
            setError("Impossibile eliminare il documento.");
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mt-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <FileText className="w-6 h-6 mr-2 text-blue-600" />
                        Knowledge Base (RAG)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Carica PDF o TXT di manuali, circolari o CCNL. Il ChatBot imparerà automaticamente da questi documenti.
                    </p>
                </div>
                <div>
                    <input
                        type="file"
                        accept=".pdf,.txt"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        disabled={uploadProgress !== null}
                    />
                    <Button
                        variant="primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadProgress !== null}
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        {uploadProgress ? 'Caricamento in corso...' : 'Aggiungi Documento'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md flex items-center text-sm">
                    <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md flex items-center text-sm">
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    {successMessage}
                </div>
            )}

            {uploadProgress && (
                <div className="mb-6 bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-blue-800">{uploadProgress.status}</span>
                        <span className="text-sm font-medium text-blue-800">
                            {uploadProgress.total > 100 ? `${Math.round((uploadProgress.current / uploadProgress.total) * 100)}%` : ''}
                        </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="mt-4">
                    {documents.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">Nessun documento nella Knowledge Base</p>
                            <p className="text-gray-400 text-sm mt-1">Carica un manuale PDF per iniziare ad addestrare il chatbot.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome File</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data di Caricamento</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {documents.map((doc) => (
                                        <tr key={doc.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center">
                                                <FileText className="w-4 h-4 mr-2 text-gray-400" />
                                                {doc.filename}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(doc.created_at).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleDelete(doc.id, doc.filename)}
                                                    className="text-red-500 hover:text-red-700 transition duration-150 ease-in-out p-1 rounded-full hover:bg-red-50 text-sm flex items-center gap-1 justify-end ml-auto"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Elimina
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
