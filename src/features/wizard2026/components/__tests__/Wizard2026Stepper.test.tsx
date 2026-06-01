import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Wizard2026Stepper } from '../Wizard2026Stepper';

describe('Wizard2026Stepper', () => {
  it('1. Renderizza correttamente tutti gli 8 step', () => {
    const handleStepClick = vi.fn();
    render(
      <Wizard2026Stepper
        currentStep={3}
        completedSteps={[1, 2]}
        allChecks={[]}
        onStepClick={handleStepClick}
      />
    );

    expect(screen.getAllByText('Ente e condizioni preliminari')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Limite art. 23')[0]).toBeInTheDocument();
    expect(screen.getAllByText('D.L. 25/2025')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Incrementi CCNL 2026')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Conglobamento art. 60')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Fondo straordinario')[0]).toBeInTheDocument();
    expect(screen.getAllByText('PNRR')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Riepilogo e trasferimento')[0]).toBeInTheDocument();
  });
});
