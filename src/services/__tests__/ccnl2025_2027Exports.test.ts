// @vitest-environment node
import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { buildCcnl20252027Workbook } from '../ccnl2025_2027ExcelService';
import { buildCcnl20252027Pdf } from '../ccnl2025_2027PdfService';
import { createDefaultSimulatorInput, createPreset, HOUR_DEFINITIONS } from '../../logic/ccnl2025_2027Defaults';
import { calculateMonthlyPayslip } from '../../logic/ccnl2025_2027PayslipEngine';
import { mkdir, writeFile } from 'node:fs/promises';

describe('Export individuali CCNL 2025–2027', () => {
  it('produce tre fogli e conserva formule, riferimenti e valori dopo il round-trip XLSX', () => {
    const s = createPreset(2), wb = buildCcnl20252027Workbook(s);
    expect(wb.SheetNames).toEqual(['1_Inquadramento_e_4_Basi', '2_Arretrati_2025_2026', '3_Simulazione_Cedolino_Regime']);
    const reopened = XLSX.read(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }), { type: 'buffer', cellFormula: true });
    const a = reopened.Sheets[wb.SheetNames[1]], m = reopened.Sheets[wb.SheetNames[2]];
    expect(a.O8.v).toBe(708.06); expect(a.O8.f).toBe('SUM(O6:O7)');
    expect(a.N6.f).toContain('SUM(I');
    const detailHeader = Object.values(a).find(cell => cell.v === 'Vecchia Tariffa (€/h)');
    expect(detailHeader).toBeDefined();
    expect(Object.values(a).some(cell => cell.v === 'Nuova Tariffa (€/h)')).toBe(true);
    expect(Object.values(a).some(cell => cell.v === 'Delta (+Δ €/h)')).toBe(true);
    const cells = Object.entries(m).filter(([key]) => !key.startsWith('!'));
    const total = cells.find(([, cell]) => cell.v === 'TOTALE CEDOLINO')![0].slice(1);
    expect(m[`F${total}`].v).toBe(calculateMonthlyPayslip(s).total);
    expect(m[`F${total}`].f).toMatch(/^SUM\(F11:F/);
    expect(cells.some(([, cell]) => typeof cell.f === 'string' && cell.f.includes("'1_Inquadramento_e_4_Basi'!"))).toBe(true);
    expect(cells.filter(([, cell]) => cell.f && cell.f.includes('ROUND(')).length).toBeGreaterThan(20);
    expect(cells.some(([, cell]) => cell.v === 'Supplementare entro soglia 115%')).toBe(true);
  });
  it('PDF A4 con appendice analitica quando tutti gli istituti sono valorizzati', async () => {
    const s = createPreset(2); s.regimeEpoch = 'DAL_LUG_2027_REGIME'; s.monthly.month = 12;
    s.profile.area = 'FUNZIONARI_EQ'; s.profile.historicalLevel = 'D7'; s.profile.newDifferentialsCount = 6;
    s.profile.specialSection = 'ALBI_ORDINI_SANITARI_ART102_106'; s.profile.isTitolareEQ = true; s.profile.retribuzionePosizioneEQAnnuoLordo = 22000;
    s.profile.usefulBaseItems = { apnrArt29: 10, adPersonamArt13: 20, ria: 30, otherContinuousC: 40, vigilanceEducatorsD: 50, otherFixedD: 60, otherVariableD: 70 };
    s.monthly.overtimeReason = 'ELETTORALE';
    HOUR_DEFINITIONS.forEach(d => { s.monthly.hours[d.key] = 10; s.arrears.hours2025[d.key] = 10; s.arrears.hours2026[d.key] = 10; });
    Object.assign(s.monthly.presence, { workingConditionsDays: 2, externalServiceDays: 2, availabilityWeekdayShifts: 2, availabilityHolidayShifts: 2, cashHandlingDays: 2, cashHandlingDailyRate: 1, previousYearShift: 936, vacationDays: 5 });
    const doc = buildCcnl20252027Pdf(s);
    expect(doc.getNumberOfPages()).toBe(3);
    expect(doc.internal.pageSize.getWidth()).toBeCloseTo(210, 1);
    expect(doc.internal.pageSize.getHeight()).toBeCloseTo(297, 1);
    const output = new Uint8Array(doc.output('arraybuffer'));
    expect(output.length).toBeGreaterThan(10000);
    if (process.env.CCNL_EXPORT_QA_DIR) {
      await mkdir(process.env.CCNL_EXPORT_QA_DIR, { recursive: true });
      await writeFile(`${process.env.CCNL_EXPORT_QA_DIR}/ccnl-stress.pdf`, output);
      XLSX.writeFile(buildCcnl20252027Workbook(s), `${process.env.CCNL_EXPORT_QA_DIR}/ccnl-stress.xlsx`);
    }
  });
  it('genera anche il PDF minimo e rifiuta un profilo non valido', () => {
    const s = createDefaultSimulatorInput();
    expect(buildCcnl20252027Pdf(s).getNumberOfPages()).toBe(2);
    s.profile.newDifferentialsCount = 99;
    expect(() => buildCcnl20252027Workbook(s)).toThrow();
    expect(() => buildCcnl20252027Pdf(s)).toThrow();
  });
});
