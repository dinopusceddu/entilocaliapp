import React, { useState } from 'react';
import { Copy, FileText, Check } from 'lucide-react';
import { Wizard2026LetterContext } from '../wizard2026LetterTypes';
import { generateWizard2026DataRequestPdf } from '../generateWizard2026DataRequestPdf';

interface Wizard2026DataRequestActionsProps {
  markdown: string;
  context: Wizard2026LetterContext;
}

export const Wizard2026DataRequestActions: React.FC<Wizard2026DataRequestActionsProps> = ({
  markdown,
  context
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Impossibile copiare il testo: ", err);
    }
  };

  const handlePdfDownload = async () => {
    try {
      setDownloading(true);
      await generateWizard2026DataRequestPdf(context);
    } catch (err) {
      console.error("Errore nel download del PDF: ", err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 mt-4">
      <button
        type="button"
        onClick={handleCopy}
        className="flex-1 h-11 min-h-[44px] flex items-center justify-center gap-2 px-4 rounded-lg bg-slate-100 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-5 h-5 text-green-600" />
            <span>Copiato negli appunti!</span>
          </>
        ) : (
          <>
            <Copy className="w-5 h-5 text-slate-500" />
            <span>Copia testo lettera</span>
          </>
        )}
      </button>

      <button
        type="button"
        onClick={handlePdfDownload}
        disabled={downloading}
        className="flex-1 h-11 min-h-[44px] flex items-center justify-center gap-2 px-4 rounded-lg bg-[#cc4331] text-white font-medium hover:bg-[#b23526] active:bg-[#9f2f24] transition-colors disabled:opacity-50"
      >
        <FileText className="w-5 h-5" />
        <span>{downloading ? 'Generazione PDF...' : 'Scarica Lettera PDF'}</span>
      </button>
    </div>
  );
};
