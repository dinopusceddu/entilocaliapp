import React, { useState, useRef, useEffect } from 'react';

export interface NormativeInfoProps {
  normativeReferenceShort?: string;
  normativeReferenceFull?: string;
  helpText?: string;
  operationalWarning?: string;
  applicability?: string;
}

export const NormativaPopover: React.FC<NormativeInfoProps> = ({
  normativeReferenceShort,
  normativeReferenceFull,
  helpText,
  operationalWarning,
  applicability,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!normativeReferenceShort && !helpText) return null;

  return (
    <div className="relative inline-block ml-2 align-middle" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center px-2 py-0.5 text-[10px] font-bold tracking-wider text-white bg-[#ea2832] rounded-full shadow-sm hover:bg-[#c02128] hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer uppercase select-none"
        aria-label="Dettagli normativi"
      >
        Rif.
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-72 sm:w-80 bg-white/95 backdrop-blur-md rounded-xl p-4 shadow-xl border border-[#f3e7e8] transition-all duration-300 ease-in-out text-[#1b0e0e]">
          <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#f3e7e8] rotate-45"></div>
          
          {normativeReferenceShort && (
            <div className="mb-2">
              <span className="text-xs font-bold text-[#ea2832] uppercase tracking-wider block">Riferimento Normativo</span>
              <span className="text-sm font-semibold text-[#1b0e0e]">{normativeReferenceShort}</span>
            </div>
          )}

          {normativeReferenceFull && (
            <div className="mb-2 p-2 bg-[#fcf8f8] rounded-lg border border-[#f3e7e8]/50">
              <p className="text-xs text-[#5f5252] leading-relaxed italic">{normativeReferenceFull}</p>
            </div>
          )}

          {helpText && (
            <div className="mb-2">
              <span className="text-xs font-bold text-[#ea2832] uppercase tracking-wider block">Supporto Operativo</span>
              <p className="text-xs text-[#1b0e0e] leading-relaxed">{helpText}</p>
            </div>
          )}

          {operationalWarning && (
            <div className="mt-2 p-2 bg-[#fef2f2] rounded-lg border border-[#fecaca] flex items-start gap-1.5">
              <svg className="w-4 h-4 text-[#ea2832] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="text-xs font-bold text-[#ea2832] uppercase tracking-wider block">Attenzione</span>
                <p className="text-[11px] text-[#994d51] leading-tight">{operationalWarning}</p>
              </div>
            </div>
          )}

          {applicability && (
            <div className="mt-2 pt-2 border-t border-[#f3e7e8] flex justify-between items-center text-[10px] text-[#5f5252]">
              <span>Applicabilità:</span>
              <span className="font-semibold">{applicability}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
