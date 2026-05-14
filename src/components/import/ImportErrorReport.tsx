import React from 'react';
import { ImportError, ImportWarning } from '../../logic/import/importDatiGeneraliService.ts';
import { AlertCircle, AlertTriangle } from 'lucide-react';

interface ImportErrorReportProps {
    errors: ImportError[];
    warnings: ImportWarning[];
}

export const ImportErrorReport: React.FC<ImportErrorReportProps> = ({ errors, warnings }) => {
    if (errors.length === 0 && warnings.length === 0) return null;

    return (
        <div className="space-y-4">
            {errors.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm">
                    <div className="flex items-center mb-2">
                        <AlertCircle className="text-red-500 mr-2" size={20} />
                        <h3 className="text-sm font-bold text-red-800 uppercase tracking-tight">Errori Bloccanti ({errors.length})</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                        {errors.map((err, idx) => (
                            <li key={idx} className="text-sm text-red-700">
                                {err.column && <span className="font-semibold">{err.column}: </span>}
                                {err.message}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-3 text-xs text-red-600 italic">Correggi gli errori nel file CSV per procedere con l'importazione.</p>
                </div>
            )}

            {warnings.length > 0 && (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-r-lg shadow-sm">
                    <div className="flex items-center mb-2">
                        <AlertTriangle className="text-orange-500 mr-2" size={20} />
                        <h3 className="text-sm font-bold text-orange-800 uppercase tracking-tight">Avvisi non bloccanti ({warnings.length})</h3>
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                        {warnings.map((warn, idx) => (
                            <li key={idx} className="text-sm text-orange-700">
                                {warn.column && <span className="font-semibold">{warn.column}: </span>}
                                {warn.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};
