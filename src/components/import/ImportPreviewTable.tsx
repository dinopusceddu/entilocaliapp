import React from 'react';
import { ImportPreviewRow } from '../../logic/import/csvMapper.ts';
import { formatCurrency } from '../../utils/formatters.ts';
import { CheckCircle, AlertTriangle, AlertCircle, PlusCircle } from 'lucide-react';

interface ImportPreviewTableProps {
    rows: ImportPreviewRow[];
}

export const ImportPreviewTable: React.FC<ImportPreviewTableProps> = ({ rows }) => {
    const formatValue = (val: any) => {
        if (val === undefined || val === null) return '-';
        if (typeof val === 'boolean') return val ? 'Sì' : 'No';
        if (typeof val === 'number') {
            // Se sembra un anno o un intero piccolo (es. abitanti), usiamo formatNumber
            if (val > 1900 && val < 2100) return val.toString();
            return formatCurrency(val);
        }
        return val.toString();
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'invariato': return 'text-gray-500 bg-gray-50';
            case 'modificato': return 'text-amber-700 bg-amber-50 border-amber-100';
            case 'nuovo': return 'text-emerald-700 bg-emerald-50 border-emerald-100';
            case 'warning': return 'text-orange-700 bg-orange-50 border-orange-100';
            case 'errore': return 'text-red-700 bg-red-50 border-red-100';
            default: return '';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'invariato': return <CheckCircle size={16} className="text-gray-400" />;
            case 'modificato': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'nuovo': return <PlusCircle size={16} className="text-emerald-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-orange-500" />;
            case 'errore': return <AlertCircle size={16} className="text-red-500" />;
            default: return null;
        }
    };

    return (
        <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Dato</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valore Attuale</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Valore CSV</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Stato</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row, idx) => (
                        <tr key={idx} className={row.status !== 'invariato' ? 'bg-amber-50/20' : ''}>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{row.field}</div>
                                <div className="text-[10px] text-gray-400 font-mono">{row.path}</div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatValue(row.currentValue)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                                <div className={`text-sm font-semibold ${row.status === 'modificato' ? 'text-blue-600' : 'text-gray-900'}`}>
                                    {formatValue(row.importedValue)}
                                </div>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-center">
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(row.status)}`}>
                                    {getStatusIcon(row.status)}
                                    <span className="capitalize">{row.status}</span>
                                </div>
                                {row.message && (
                                    <div className="mt-1 text-[10px] text-orange-600 italic">{row.message}</div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
