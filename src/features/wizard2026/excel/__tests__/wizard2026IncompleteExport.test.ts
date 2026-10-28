import { beforeEach, describe, expect, it, vi } from 'vitest';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { createEmptyWizard2026DraftState } from '../../initialState';
import { calculateArt23Limit, validateArt23Limit } from '../../../../logic/wizard2026/art23Limit';
import { exportWizard2026Excel } from '../exportWizard2026Excel';
import { importWizard2026Excel } from '../importWizard2026Excel';

vi.mock('file-saver', () => ({ saveAs: vi.fn() }));

function draft(limit?: number) {
  const state = createEmptyWizard2026DraftState();
  state.ente = { ...state.ente, denominazioneEnte: 'FIXTURE_EXPORT', entityType: 'COMUNE', hasDirigenza: false };
  state.art23.limite2016CertificatoEnte = limit;
  state.art23.result = calculateArt23Limit(state.art23);
  state.art23.checks = validateArt23Limit(state.art23);
  return state;
}

async function serialized(state: ReturnType<typeof draft>) {
  await exportWizard2026Excel(state, 'FIXTURE_EXPORT', 2026);
  const blob = vi.mocked(saveAs).mock.calls[0][0] as Blob;
  const buffer = await blob.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  return { workbook, buffer };
}

describe('POST-ASTRA: incomplete historical limit in serialized Wizard Excel', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('reproduces canonical compatibility zeros but exports unavailable dependent values', async () => {
    const state = draft();
    expect(state.art23.result?.limiteArt23Attualizzato).toBe(0);
    expect(state.art23.result?.margineArt23).toBe(0);
    expect(state.art23.checks.some(c => c.id === 'ART23-BASE-2016-MISSING')).toBe(true);
    const { workbook } = await serialized(state);
    const summary = workbook.getWorksheet('Riepilogo Calcolato')!;
    expect(workbook.getWorksheet('Art. 23 Limite')!.getCell('C2').value).toBe('');
    expect(summary.getCell('C2').value).toBe('n/d');
    expect(summary.getCell('C4').value).toBe('n/d');
    expect(summary.getCell('C5').value).toBe('n/d');
    expect(summary.getCell('C3').value).toBe(0); // independent adjustment remains untouched
  });

  it.each([0, 125000.5])('preserves a genuinely provided limit %s and canonical amounts', async limit => {
    const state = draft(limit);
    const { workbook } = await serialized(state);
    const summary = workbook.getWorksheet('Riepilogo Calcolato')!;
    expect(summary.getCell('C4').value).toBe(state.art23.result!.limiteArt23Attualizzato);
    expect(summary.getCell('C5').value).toBe(state.art23.result!.margineArt23);
    expect(summary.getCell('C4').value).toBe(limit);
  });

  it('preserves a supplied analytic reconstruction including an explicit zero', async () => {
    const state = draft();
    state.art23.fondoPersonaleDipendente2016 = 0;
    state.art23.result = calculateArt23Limit(state.art23);
    const { workbook } = await serialized(state);
    expect(workbook.getWorksheet('Riepilogo Calcolato')!.getCell('C4').value).toBe(0);
  });

  it('keeps nine sheets, no formulas, input reimport, and independent CCNL results', async () => {
    const state = draft();
    state.ccnl2026.monteSalari2021 = 1000000;
    state.ccnl2026.result = { isCalcolabile: true, incrementoStabile014: 1400, arretrati014: 2800 } as any;
    const { workbook, buffer } = await serialized(state);
    expect(workbook.worksheets.map(s => s.name)).toEqual(['Istruzioni', 'Dati Ente', 'Art. 23 Limite', 'D.L. 25-2025', 'CCNL 2026', 'Conglobamento Art. 60', 'Straordinario', 'PNRR', 'Riepilogo Calcolato']);
    for (const sheet of workbook.worksheets) sheet.eachRow(row => row.eachCell(cell => {
      expect(cell.type).not.toBe(ExcelJS.ValueType.Formula);
      expect(cell.type).not.toBe(ExcelJS.ValueType.Error);
    }));
    expect(workbook.getWorksheet('Riepilogo Calcolato')!.getCell('C7').value).toBe(1400);
    const imported = await importWizard2026Excel(new File([buffer], 'fixture.xlsx'));
    expect(imported.resultState.art23?.limite2016CertificatoEnte).toBeUndefined();
    expect(imported.resultState.ccnl2026?.monteSalari2021).toBe(1000000);
    expect(imported.resultState.ente?.entityType).toBe('COMUNE');
    expect(workbook.getWorksheet('Istruzioni')!.getCell('C8').value).toContain('non costituisce');
  });
});
