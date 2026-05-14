import React from 'react';
import { Copy, Download, FileText, Check } from 'lucide-react';
import { Button } from '../shared/Button';

interface RequestDataLetterActionsProps {
    markdown: string;
    onDownloadPdf: () => void;
    isGeneratingPdf?: boolean;
}

export const RequestDataLetterActions: React.FC<RequestDataLetterActionsProps> = ({ 
    markdown, 
    onDownloadPdf,
    isGeneratingPdf 
}) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownloadMd = () => {
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'richiesta_dati_fondo.md';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-wrap gap-3 justify-end mt-6 border-t pt-6">
            <Button
                variant="secondary"
                onClick={handleCopy}
                className="flex items-center gap-2"
            >
                {copied ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                {copied ? 'Copiato!' : 'Copia Testo'}
            </Button>
            
            <Button
                variant="secondary"
                onClick={handleDownloadMd}
                className="flex items-center gap-2"
            >
                <Download size={18} />
                Scarica .md
            </Button>

            <Button
                variant="primary"
                onClick={onDownloadPdf}
                isLoading={isGeneratingPdf}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
                <FileText size={18} />
                Esporta PDF
            </Button>
        </div>
    );
};
