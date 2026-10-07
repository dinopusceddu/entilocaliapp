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
  it('1. Senza ente selezionato mostra il motivo operativo e impedisce il trasferimento', () => {
    render(<Step8RiepilogoPreview state={initialWizard2026DraftState} />);
    
    // Titolo e dicitura
    expect(screen.getAllByText('Trasferisci i dati alla costituzione del fondo e compila')[0]).toBeInTheDocument();
    
    // Badge
    expect(screen.getByText('Dati da completare')).toBeInTheDocument();
    
    // Spiegazione estesa
    expect(screen.getByText(/Seleziona ente e annualità e attendi il caricamento dei dati\./i)).toBeInTheDocument();
    
    // Contesto mancante: pulsante disabilitato
    const transferBtn = screen.getByRole('button', { name: 'Trasferisci i dati alla costituzione del fondo e compila' });
    expect(transferBtn).toBeInTheDocument();
    expect(transferBtn).toBeDisabled();
  });
});
