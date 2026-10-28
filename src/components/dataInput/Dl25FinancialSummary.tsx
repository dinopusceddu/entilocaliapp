import { Input } from '../shared/Input';
import type { SimulatoreIncrementoInput, SimulatoreIncrementoRisultati } from '../../domain/types';
import type { Dl25Regime } from '../../logic/shared/dl25Regime';
import { formatCurrency } from '../../utils/formatters';

export function Dl25FinancialSummary({ result, regime }: { result?: SimulatoreIncrementoRisultati; regime?: Dl25Regime }) {
  const effective = result?.regime ?? regime;
  return <div data-testid="dl25-financial-summary" className="space-y-2 text-sm">
    <p>Regime L.296/2006: <strong>{effective === 'L296_DISAPPLIED' ? 'Non applicabile dal 08/08/2026 per questo ente soggetto ad Art.33' : effective === 'HISTORICAL' ? 'Applicabile' : 'Da determinare: verificare data business e perimetro Art.33'}</strong></p>
    <p>Nuovo incremento massimo dopo i vincoli finanziari, al netto degli oneri: <strong>{result?.state === 'VALID' && result.fase5_incrementoNettoEffettivoFondo !== undefined ? formatCurrency(result.fase5_incrementoNettoEffettivoFondo) : 'Da determinare'}</strong></p>
    {result?.dateIndifferent && <p>Il valore è identico nei regimi pre e post 08/08/2026; la data mancante non incide su questo risultato.</p>}
  </div>;
}

export function Dl25FinancialFields({ value = {}, onChange }: { value?: SimulatoreIncrementoInput; onChange: (v: SimulatoreIncrementoInput) => void }) {
  const fields: [keyof SimulatoreIncrementoInput, string][] = [
    ['simSpesaPersonaleConsuntivo2023', 'Spesa personale di riferimento per i margini finanziari (lordo ente)'],
    ['simMediaEntrateCorrenti2021_2023', 'Media entrate correnti nette per sostenibilità Art.33'],
    ['simCostoAnnuoNuoveAssunzioniPIAO', 'Costo annuo nuove assunzioni PIAO (lordo ente)'],
    ['simTettoSpesaPersonaleL296_06', 'Tetto storico L.296/2006 (lordo ente)'],
    ['simPercentualeOneriIncremento', 'Oneri riflessi dell’incremento (%)'],
  ];
  return <div className="space-y-2"><p>I margini finanziari sono lordi ente; solo questi vengono convertiti a netto prima del confronto con il residuo DL25.</p>
    {fields.map(([key, label]) => <label key={key} className="block">{label}<Input name={key} type="number" min="0" step="0.01" aria-label={label} className="block border rounded p-2" value={value[key] ?? ''} onChange={e => onChange({ ...value, [key]: e.target.value === '' ? undefined : Number(e.target.value) })} /></label>)}
  </div>;
}
