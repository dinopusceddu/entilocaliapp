import React, { useState } from 'react';
import { Wizard2026Check } from '../../../logic/wizard2026';
import { Check, AlertCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

export interface Wizard2026StepperProps {
  currentStep: number;
  completedSteps: number[];
  allChecks: Wizard2026Check[];
  onStepClick: (step: number) => void;
}

const STEPS_CONFIG = [
  { num: 1, label: 'Ente e condizioni preliminari', shortLabel: 'Ente', idPrefix: 'ENTE' },
  { num: 2, label: 'Limite art. 23', shortLabel: 'Art. 23', idPrefix: 'ART23' },
  { num: 3, label: 'D.L. 25/2025', shortLabel: 'D.L. 25', idPrefix: 'DL25' },
  { num: 4, label: 'Incrementi CCNL 2026', shortLabel: 'CCNL 2026', idPrefix: 'CCNL2026' },
  { num: 5, label: 'Conglobamento art. 60', shortLabel: 'Art. 60', idPrefix: 'ART60' },
  { num: 6, label: 'Fondo straordinario', shortLabel: 'Straordinario', idPrefix: 'STRAORD' },
  { num: 7, label: 'PNRR', shortLabel: 'PNRR', idPrefix: 'PNRR' },
  { num: 8, label: 'Riepilogo e trasferimento', shortLabel: 'Riepilogo', idPrefix: 'RIEPILOGO' },
];

export const Wizard2026Stepper: React.FC<Wizard2026StepperProps> = ({
  currentStep,
  completedSteps,
  allChecks,
  onStepClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const currentStepConfig = STEPS_CONFIG.find((s) => s.num === currentStep);

  return (
    <div className="bg-white border-b shadow-sm font-sans">
      {/* Mobile/Tablet Header: Step X di 8 + Title */}
      <div className="lg:hidden px-4 py-3 flex items-center justify-between bg-slate-50 border-b border-slate-200">
        <div className="flex flex-col min-w-0 flex-1 pr-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
            Step {currentStep} di 8
          </span>
          <span className="text-sm font-bold text-slate-900 truncate">
            {currentStepConfig?.label}
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition-colors flex-shrink-0"
        >
          <span>Elenco step</span>
          {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
        </button>
      </div>

      {/* Grid or List of Steps: Visible on Desktop, or when toggled Open on Mobile */}
      <div className={`${isOpen ? 'block' : 'hidden lg:block'} px-4 lg:px-6 py-4`}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3 lg:gap-2">
          {STEPS_CONFIG.map((step, idx) => {
            const isCurrent = currentStep === step.num;
            const isCompleted = completedSteps.includes(step.num);

            const stepChecks = allChecks.filter((c) => c.step.includes(`Step ${step.num}`) || c.id.startsWith(step.idPrefix));
            const hasErrors = stepChecks.some((c) => c.severity === 'error');
            const hasWarns = stepChecks.some((c) => c.severity === 'warning');

            let badgeColor = 'bg-slate-100 text-slate-600 border-slate-300';
            if (isCurrent) badgeColor = 'bg-[#cc4331] text-white border-[#cc4331] ring-4 ring-[#f3c7bf] shadow-sm';
            else if (hasErrors) badgeColor = 'bg-red-500 text-white border-red-500 ring-2 ring-red-100';
            else if (hasWarns) badgeColor = 'bg-amber-500 text-white border-amber-500 ring-2 ring-amber-100';
            else if (isCompleted) badgeColor = 'bg-green-600 text-white border-green-600';

            return (
              <React.Fragment key={step.num}>
                <button
                  onClick={() => {
                    onStepClick(step.num);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 lg:gap-2.5 group whitespace-nowrap focus:outline-none transition-all w-full lg:w-auto p-2.5 lg:p-0 rounded-lg hover:bg-slate-50 lg:hover:bg-transparent ${isCurrent ? 'bg-slate-50 lg:bg-transparent opacity-100 scale-[1.01] lg:scale-105' : 'opacity-75 hover:opacity-100'}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border font-mono transition-all flex-shrink-0 ${badgeColor}`}>
                    {hasErrors ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : hasWarns ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : isCompleted && !isCurrent ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.num
                    )}
                  </div>
                  <div className="text-left">
                    <div className={`text-[10px] lg:text-xs font-semibold leading-none mb-1 ${isCurrent ? 'text-[#cc4331] font-bold' : hasErrors ? 'text-red-600' : hasWarns ? 'text-amber-600' : 'text-slate-700'}`}>
                      Step {step.num}
                    </div>
                    <div className={`text-xs font-medium lg:max-w-[130px] lg:truncate leading-tight ${isCurrent ? 'text-slate-900 font-semibold' : 'text-slate-500'}`}>
                      <span className="lg:hidden">{step.shortLabel}</span>
                      <span className="hidden lg:inline">{step.label}</span>
                    </div>
                  </div>
                </button>
                {idx < STEPS_CONFIG.length - 1 && (
                  <div className={`hidden lg:block flex-1 h-0.5 min-w-[16px] transition-colors ${completedSteps.includes(step.num) ? 'bg-green-500' : 'bg-slate-200'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
