import React from 'react';
import { ArrowLeft, ArrowRight, RotateCcw, CheckSquare } from 'lucide-react';

export interface Wizard2026NavigationButtonsProps {
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onGoToSummary: () => void;
  onReset: () => void;
  hasErrors: boolean;
}

export const Wizard2026NavigationButtons: React.FC<Wizard2026NavigationButtonsProps> = ({
  currentStep,
  onNext,
  onPrevious,
  onGoToSummary,
  onReset,
}) => {
  return (
    <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full font-sans">
      {/* Mobile-only layout (below sm) */}
      <div className="flex flex-col gap-3 sm:hidden w-full">
        <div className="grid grid-cols-2 gap-3 w-full">
          {currentStep > 1 ? (
            <button
              onClick={onPrevious}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold text-sm h-11 active:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
              <span>Indietro</span>
            </button>
          ) : <div />}
          {currentStep < 8 ? (
            <button
              onClick={onNext}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-[#cc4331] text-white font-semibold text-sm h-11 active:bg-[#9f2f24] transition-colors shadow-sm shadow-red-600/20"
            >
              <span>Avanti</span>
              <ArrowRight className="w-4.5 h-4.5" />
            </button>
          ) : <div />}
        </div>
        {currentStep < 8 && (
          <button
            onClick={onGoToSummary}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-[#f3c7bf] bg-[#fff7f5] text-[#cc4331] font-semibold text-sm h-11 active:bg-[#f3c7bf]/30 transition-colors shadow-sm"
          >
            <CheckSquare className="w-4.5 h-4.5" />
            <span>Vai al riepilogo</span>
          </button>
        )}
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg border border-slate-200 bg-white text-slate-600 font-medium text-sm h-11 active:bg-slate-50 transition-colors"
          title="Ripristina i valori iniziali della compilazione"
        >
          <RotateCcw className="w-4.5 h-4.5" />
          <span>Ripristina bozza</span>
        </button>
      </div>

      {/* Desktop/Tablet layout (sm and up) */}
      <div className="hidden sm:flex items-center justify-between w-full">
        <div>
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-medium text-sm hover:bg-slate-50 transition-colors shadow-sm"
            title="Ripristina i valori iniziali della compilazione"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ripristina bozza</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {currentStep > 1 && (
            <button
              onClick={onPrevious}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Indietro</span>
            </button>
          )}

          {currentStep < 8 && (
            <button
              onClick={onNext}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#cc4331] text-white font-semibold text-sm hover:bg-[#9f2f24] transition-colors shadow-sm shadow-red-600/20"
            >
              <span>Avanti</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {currentStep < 8 && (
            <button
              onClick={onGoToSummary}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#f3c7bf] bg-[#fff7f5] text-[#cc4331] font-semibold text-sm hover:bg-[#f3c7bf]/30 transition-colors shadow-sm"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Vai al riepilogo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
