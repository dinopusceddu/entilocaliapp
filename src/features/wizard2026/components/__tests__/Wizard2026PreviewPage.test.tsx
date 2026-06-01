import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Wizard2026PreviewPage } from '../Wizard2026PreviewPage';
import { Step8RiepilogoPreview } from '../../steps/Step8RiepilogoPreview';
import { initialWizard2026DraftState } from '../../index';

describe('Wizard2026PreviewPage Smoke Test', () => {
  it('1. Renderizza l\'avviso della modalità preview e il titolo iniziale', () => {
    render(<Wizard2026PreviewPage />);
    
    expect(screen.getAllByText(/Flusso 2026 attivo/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText('Ente e condizioni preliminari')[0]).toBeInTheDocument();
    expect(screen.getByText(/Inquadramento Soggettivo e Finanziario/i)).toBeInTheDocument();
  });
});

describe('Step8RiepilogoPreview & Trasferimento (MOD-022)', () => {
  it('1. Mostra la sezione del trasferimento con i testi e badge corretti', () => {
    render(<Step8RiepilogoPreview state={initialWizard2026DraftState} />);
    
    // Titolo e dicitura
    expect(screen.getAllByText('Trasferisci i dati alla costituzione del fondo e compila')[0]).toBeInTheDocument();
    
    // Badge
    expect(screen.getByText('Richiede conferma')).toBeInTheDocument();
    
    // Spiegazione estesa
    expect(screen.getByText(/Facendo clic su questo pulsante, si avvierà la procedura guidata di trasferimento dati, con anteprima dettagliata prima e dopo e salvataggio di uno snapshot di sicurezza per rollback\./i)).toBeInTheDocument();
    
    // Pulsante abilitato
    const transferBtn = screen.getByRole('button', { name: 'Trasferisci i dati alla costituzione del fondo e compila' });
    expect(transferBtn).toBeInTheDocument();
    expect(transferBtn).not.toBeDisabled();
  });
});
