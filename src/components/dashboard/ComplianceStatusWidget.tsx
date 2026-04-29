// components/dashboard/ComplianceStatusWidget.tsx
import React from 'react';
import { ComplianceCheck } from '../../domain';
import { Card } from '../shared/Card';
import { TEXTS_UI } from '../../constants';
import { useAppContext } from '../../contexts/AppContext';
import { Button } from '../shared/Button'; 

interface ComplianceStatusWidgetProps {
  complianceChecks: ComplianceCheck[];
}

const getIconForGravita = (gravita: 'info' | 'warning' | 'error'): string => {
  if (gravita === 'error') return '❌';
  if (gravita === 'warning') return '⚠️';
  return 'ℹ️'; 
};

const getStylesForGravita = (gravita: 'info' | 'warning' | 'error'): { card: string; title: string; iconText: string } => {
  if (gravita === 'error') return { 
    card: 'bg-[#fef2f2] border-[#fecaca]',
    title: 'text-[#991b1b]',
    iconText: 'text-[#ef4444]'
  };
  if (gravita === 'warning') return { 
    card: 'bg-[#fffbeb] border-[#fde68a]',
    title: 'text-[#92400e]',
    iconText: 'text-[#f59e0b]'
  };
  return { 
    card: 'bg-[#eff6ff] border-[#bfdbfe]',
    title: 'text-[#1e40af]',
    iconText: 'text-[#3b82f6]'
  };
};


export const ComplianceStatusWidget: React.FC<ComplianceStatusWidgetProps> = ({ complianceChecks }) => {
  const { dispatch } = useAppContext(); 
  
  if (!complianceChecks || complianceChecks.length === 0) {
    return (
      <Card title="Stato di Conformità Normativa">
        <p className="text-[#1b0e0e]">{TEXTS_UI.noDataAvailable} Nessun controllo di conformità eseguito o dati non disponibili.</p>
      </Card>
    );
  }

  const criticalIssues = complianceChecks.filter(c => c.gravita === 'error').length;
  const warnings = complianceChecks.filter(c => c.gravita === 'warning').length;

  return (
    <Card title="Stato di Conformità Normativa" className="mb-8">
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2">
        {criticalIssues > 0 && <p className={`font-semibold ${getStylesForGravita('error').title}`}>{criticalIssues} Criticità Rilevate</p>}
        {warnings > 0 && <p className={`font-semibold ${getStylesForGravita('warning').title}`}>{warnings} Avvisi da Verificare</p>}
        {criticalIssues === 0 && warnings === 0 && <p className="font-semibold text-green-700">Nessuna criticità o avviso rilevante.</p>}
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar space */}
        {complianceChecks.map(check => {
          const styles = getStylesForGravita(check.gravita);
          return (
            <div key={check.id} className={`p-3 border rounded-lg ${styles.card}`}>
              <div className="flex items-start">
                <span className={`text-xl mr-3 ${styles.iconText}`}>{getIconForGravita(check.gravita)}</span>
                <div className="flex-1">
                  <h5 className={`font-semibold ${styles.title}`}>{check.descrizione}</h5>
                  <p className="text-sm text-[#1b0e0e]">{check.messaggio}</p>
                  <p className="text-xs text-[#5f5252] mt-1">
                    Valore: {check.valoreAttuale ?? TEXTS_UI.notApplicable} {check.limite ? `(Limite: ${check.limite})` : ''} - Rif: {check.riferimentoNormativo}
                  </p>
                  {check.relatedPage && check.gravita !== 'info' && (
                    <div className="mt-2">
                        <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-xs"
                            onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: check.relatedPage! })}
                        >
                            Vai alla correzione →
                        </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
       <div className="mt-6 text-center">
          <Button 
            variant="link" 
            onClick={() => dispatch({type: 'SET_ACTIVE_TAB', payload: 'compliance'})} 
          >
            Vedi dettagli conformità
          </Button>
      </div>
    </Card>
  );
};
