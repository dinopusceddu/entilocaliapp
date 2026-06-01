import React from 'react';
import { Calculator } from 'lucide-react';

export interface Wizard2026ResultCardProps {
  title: string;
  amount?: number;
  formula?: string;
  description?: string;
  variant?: 'primary' | 'success' | 'warning' | 'neutral' | 'cgil';
  isCurrency?: boolean;
}

export const Wizard2026ResultCard: React.FC<Wizard2026ResultCardProps> = ({
  title,
  amount,
  formula,
  description,
  variant = 'primary',
  isCurrency = true,
}) => {
  const formattedAmount = amount === undefined
    ? 'n/d'
    : isCurrency
      ? new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(amount)
      : new Intl.NumberFormat('it-IT').format(amount);

  const colors = {
    primary: 'border-blue-200 bg-blue-50/50 text-blue-900',
    success: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
    warning: 'border-amber-200 bg-amber-50/50 text-amber-900',
    neutral: 'border-slate-200 bg-slate-50/50 text-slate-900',
    cgil: 'border-[#CC4331]/20 bg-[#FFF4F2]/50 text-slate-900',
  }[variant];

  const badgeBg = {
    primary: 'bg-blue-600 text-white',
    success: 'bg-emerald-600 text-white',
    warning: 'bg-amber-600 text-white',
    neutral: 'bg-slate-700 text-white',
    cgil: 'bg-[#CC4331] text-white',
  }[variant];

  return (
    <div className={`border rounded-xl p-4 sm:p-5 shadow-sm transition-all font-sans min-w-0 overflow-hidden ${colors}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h5 className="font-semibold text-base sm:text-lg leading-tight mb-1 break-words whitespace-normal" title={title}>{title}</h5>
          {description && <p className="text-xs opacity-85 leading-normal break-words whitespace-normal">{description}</p>}
        </div>
        <div className={`p-2 rounded-lg flex-shrink-0 ${badgeBg}`}>
          <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>
      
      <div className="pt-3 border-t border-black/10 mt-2 flex flex-col gap-2 min-w-0">
        {formula && (
          <div className="font-mono text-[11px] sm:text-xs opacity-75 break-words whitespace-normal bg-black/5 px-2 py-1 rounded">
            <span className="font-sans font-semibold block text-[9px] uppercase tracking-wide text-slate-500 mb-0.5">Dettaglio formula</span>
            {formula}
          </div>
        )}
        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-slate-900 break-words whitespace-normal mt-1">
          {formattedAmount}
        </div>
      </div>
    </div>
  );
};
