import React from 'react';
import { Wizard2026Check } from '../../../logic/wizard2026';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

export interface Wizard2026CheckListProps {
  checks: Wizard2026Check[];
  title?: string;
}

export const Wizard2026CheckList: React.FC<Wizard2026CheckListProps> = ({ checks, title = 'Esito Verifiche e Controlli' }) => {
  if (checks.length === 0) return null;

  return (
    <div className="mt-6 border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="bg-slate-50 px-4 py-3 border-b font-semibold text-slate-700 flex items-center justify-between">
        <span>{title}</span>
        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
          {checks.length} riscontr{checks.length === 1 ? 'o' : 'i'}
        </span>
      </div>
      <div className="divide-y divide-slate-100">
        {checks.map((check) => {
          const isError = check.severity === 'error';
          const isWarn = check.severity === 'warning';

          const bg = isError ? 'bg-red-50/50' : isWarn ? 'bg-amber-50/50' : 'bg-slate-50/50';
          const iconColor = isError ? 'text-red-600' : isWarn ? 'text-amber-600' : 'text-slate-500';
          const badgeBg = isError ? 'bg-red-100 text-red-700 border-red-200' : isWarn ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200';

          return (
            <div key={check.id} className={`p-4 flex items-start gap-3 transition-colors ${bg}`}>
              {isError ? (
                <AlertCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
              ) : isWarn ? (
                <AlertTriangle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
              ) : (
                <Info className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColor}`} />
              )}
              <div className="flex-1 text-sm">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border uppercase ${badgeBg}`}>
                    {check.severity === 'error' ? 'Errore' : check.severity === 'warning' ? 'Avviso' : check.severity}
                  </span>
                  <span className="text-xs font-mono text-slate-500">{check.id}</span>
                  {check.norma && <span className="text-xs text-slate-500 w-full sm:w-auto sm:ml-auto font-medium block sm:inline">{check.norma}</span>}
                </div>
                <div className="text-slate-800 font-medium leading-relaxed">{check.message}</div>
                {check.expectedValue !== undefined && check.currentValue !== undefined && (
                  <div className="mt-2 text-xs text-slate-600 bg-white/80 p-2 rounded border border-slate-200 flex flex-col sm:flex-row sm:gap-4 gap-1">
                    <span><strong>Valore attuale:</strong> {String(check.currentValue)}</span>
                    <span><strong>Valore atteso/limite:</strong> {String(check.expectedValue)}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
