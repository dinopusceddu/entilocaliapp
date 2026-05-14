import React, { useState, useRef } from 'react';
import { Modal } from '../shared/Modal.tsx';
import { importDatiGeneraliFromCsv, ImportResult } from '../../logic/import/importDatiGeneraliService.ts';
import { ImportPreviewTable } from './ImportPreviewTable.tsx';
import { ImportErrorReport } from './ImportErrorReport.tsx';
import { FundData } from '../../domain/types';
import { FileUp, X, Check, Loader2 } from 'lucide-react';

interface CsvImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentFundData: FundData;
    selectedYear: number;
    onImportConfirmed: (mappedData: Partial<FundData>) => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
    isOpen,
    onClose,
    currentFundData,
    selectedYear,
    onImportConfirmed
}) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setIsProcessing(true);
            const res = await importDatiGeneraliFromCsv(selectedFile, currentFundData, selectedYear);
            setResult(res);
            setIsProcessing(false);
        }
    };

    const handleConfirm = () => {
        if (result?.mappedData) {
            if (window.confirm('Sei sicuro di voler sovrascrivere i dati attuali con quelli del CSV? L\'operazione non è annullabile.')) {
                onImportConfirmed(result.mappedData);
                onClose();
            }
        }
    };

    const reset = () => {
        setFile(null);
        setResult(null);
        setIsProcessing(false);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Importazione Dati Generali da CSV"
            size="xl"
        >
            <div className="space-y-6 py-2">
                {!file ? (
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
                    >
                        <FileUp className="mx-auto h-16 w-16 text-gray-400 group-hover:text-blue-500 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">Seleziona il file CSV</h3>
                        <p className="text-sm text-gray-500 mt-2">
                            Usa il template standard separato da punto e virgola (;)
                        </p>
                        <input 
                            type="file" 
                            className="hidden" 
                            accept=".csv"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg">
                                    <FileUp className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{file.name}</div>
                                    <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</div>
                                </div>
                            </div>
                            <button 
                                onClick={reset}
                                className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {isProcessing ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
                                <p className="text-gray-600 font-medium">Analisi in corso...</p>
                            </div>
                        ) : result ? (
                            <div className="space-y-6">
                                <ImportErrorReport 
                                    errors={result.errors} 
                                    warnings={result.warnings} 
                                />

                                {result.previewRows.length > 0 && (
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Anteprima Modifiche</h3>
                                            <div className="text-xs text-gray-500">
                                                {result.previewRows.filter(r => r.status !== 'invariato').length} modifiche rilevate
                                            </div>
                                        </div>
                                        <ImportPreviewTable rows={result.previewRows} />
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Annulla
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!result || !result.success || result.errors.length > 0 || isProcessing}
                        className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold shadow-sm transition-all
                            ${!result || !result.success || result.errors.length > 0 || isProcessing
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 active:transform active:scale-95'}`}
                    >
                        <Check size={18} />
                        Applica Modifiche
                    </button>
                </div>
            </div>
        </Modal>
    );
};
