import React, { useState, useMemo } from 'react';
import { Modal } from '../shared/Modal';
import { useAppContext } from '../../contexts/AppContext';
import { buildLetterContext } from '../../logic/letters/letterRequestDataContext';
import { generateRequestDataLetterMarkdown } from '../../logic/letters/letterRequestDataGenerator';
import { generateRequestDataLetterPdf } from '../../services/requestDataLetterPdfService';
import { RequestDataLetterPreview } from './RequestDataLetterPreview';
import { RequestDataLetterActions } from './RequestDataLetterActions';
import { Input } from '../shared/Input';
import { AlertCircle } from 'lucide-react';

interface RequestDataLetterModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RequestDataLetterModal: React.FC<RequestDataLetterModalProps> = ({ isOpen, onClose }) => {
    const { state } = useAppContext();
    const [firmatario, setFirmatario] = useState('');
    const [organizzazione, setOrganizzazione] = useState('FP CGIL');
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

    const letterContent = useMemo(() => {
        const context = buildLetterContext(state.fundData, { 
            firmatario: firmatario || undefined, 
            organizzazione: organizzazione || undefined 
        });
        return generateRequestDataLetterMarkdown(context);
    }, [state.fundData, firmatario, organizzazione]);

    const handleDownloadPdf = async () => {
        setIsGeneratingPdf(true);
        try {
            const context = buildLetterContext(state.fundData, { 
                firmatario: firmatario || undefined, 
                organizzazione: organizzazione || undefined 
            });
            await generateRequestDataLetterPdf(context);
        } catch (error) {
            console.error('Errore generazione PDF:', error);
            alert('Errore durante la generazione del PDF.');
        } finally {
            setIsGeneratingPdf(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Generatore Lettera Richiesta Dati"
            size="xl"
        >
            <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <p className="text-sm text-blue-800">
                        Questa lettera viene generata automaticamente evidenziando i dati mancanti nel sistema. 
                        Puoi personalizzare il firmatario e l'organizzazione qui sotto.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Firmatario"
                        placeholder="Es. Il Segretario Generale"
                        value={firmatario}
                        onChange={(e) => setFirmatario(e.target.value)}
                    />
                    <Input
                        label="Organizzazione"
                        placeholder="Es. FP CGIL Lombardia"
                        value={organizzazione}
                        onChange={(e) => setOrganizzazione(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Anteprima Lettera</label>
                    <RequestDataLetterPreview markdown={letterContent} />
                </div>

                <RequestDataLetterActions 
                    markdown={letterContent}
                    onDownloadPdf={handleDownloadPdf}
                    isGeneratingPdf={isGeneratingPdf}
                />
            </div>
        </Modal>
    );
};
