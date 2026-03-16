import React from 'react';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';
import { Select } from '../shared/Select';
import {
  AreaCCNL,
  FaseContrattuale,
  TipoOrario,
  TipoPartTime,
  TipoStraordinario,
  TipoTurno,
  ModalitaRecuperoStraordinario,
  InputCompensatore,
} from '../../types/compensiTypes';
import { STIPENDI_TABELLARI } from '../../logic/compensiCalculations';

interface CompensatoreInputFormProps {
  input: InputCompensatore;
  onChange: (updated: InputCompensatore) => void;
}

const OPZIONI_AREA = [
  { value: AreaCCNL.OPERATORE, label: 'Operatore (Area A)' },
  { value: AreaCCNL.OPERATORE_ESPERTO, label: 'Operatore Esperto (Area B)' },
  { value: AreaCCNL.ISTRUTTORE, label: 'Istruttore (Area C)' },
  { value: AreaCCNL.FUNZIONARIO_EQ, label: 'Funzionario / EQ (Area D)' },
];

const OPZIONI_FASE = [
  { value: FaseContrattuale.CCNL_2019_2021, label: 'CCNL 2019-2021 (tabellari 2021)' },
  { value: FaseContrattuale.TRANSIZIONE_2024_2025, label: 'Transizione 2024-2025 (IVC conglobata)' },
  { value: FaseContrattuale.REGIME_2026, label: 'Regime 2026 (CCNL 23.02.2026)' },
];

const OPZIONI_ORARIO = [
  { value: TipoOrario.ORE_36, label: '36 ore settimanali' },
  { value: TipoOrario.ORE_35, label: '35 ore settimanali' },
  { value: TipoOrario.PART_TIME, label: 'Part-time' },
];

const OPZIONI_TIPO_PARTTIME = [
  { value: TipoPartTime.ORIZZONTALE, label: 'Orizzontale' },
  { value: TipoPartTime.VERTICALE, label: 'Verticale' },
  { value: TipoPartTime.MISTO, label: 'Misto' },
];

const OPZIONI_MODALITA_RECUPERO = [
  { value: ModalitaRecuperoStraordinario.PAGAMENTO, label: 'Pagamento in busta paga' },
  { value: ModalitaRecuperoStraordinario.BANCA_ORE, label: 'Banca delle ore (art. 33)' },
];

const MESI = [
  { value: 1, label: 'Gennaio' }, { value: 2, label: 'Febbraio' }, { value: 3, label: 'Marzo' },
  { value: 4, label: 'Aprile' }, { value: 5, label: 'Maggio' }, { value: 6, label: 'Giugno' },
  { value: 7, label: 'Luglio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Settembre' },
  { value: 10, label: 'Ottobre' }, { value: 11, label: 'Novembre' }, { value: 12, label: 'Dicembre' },
];

function getPosizioniPerArea(fase: FaseContrattuale, area: AreaCCNL) {
  const tabella = STIPENDI_TABELLARI[fase]?.[area] ?? {};
  return Object.keys(tabella).map(pos => ({ value: pos, label: pos }));
}

export const CompensatoreInputForm: React.FC<CompensatoreInputFormProps> = ({ input, onChange }) => {
  const update = (partial: Partial<InputCompensatore>) => onChange({ ...input, ...partial });

  const posizioniDisponibili = getPosizioniPerArea(input.faseContrattuale, input.area);

  return (
    <div className="space-y-4">

      {/* Sezione 1 — Periodo e Fase Contrattuale */}
      <Card title="1. Periodo e Contratto" isCollapsible defaultCollapsed={false}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
          <Input
            label="Anno di riferimento"
            type="number"
            id="anno"
            value={input.annoRiferimento}
            onChange={e => update({ annoRiferimento: parseInt(e.target.value) || new Date().getFullYear() })}
            min={2019}
            max={2030}
          />
          <Select
            label="Mese di riferimento"
            id="mese"
            options={MESI}
            value={input.meseRiferimento}
            onChange={e => update({ meseRiferimento: parseInt(e.target.value) })}
          />
          <Select
            label="Fase contrattuale"
            id="fase"
            options={OPZIONI_FASE}
            value={input.faseContrattuale}
            onChange={e => update({ faseContrattuale: e.target.value as FaseContrattuale, posizioneEconomica: '' })}
          />
        </div>
      </Card>

      {/* Sezione 2 — Profilo Professionale */}
      <Card title="2. Profilo Professionale" isCollapsible defaultCollapsed={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          <Select
            label="Area contrattuale"
            id="area"
            options={OPZIONI_AREA}
            value={input.area}
            onChange={e => update({ area: e.target.value as AreaCCNL, posizioneEconomica: '' })}
          />
          <Select
            label="Posizione economica"
            id="posizione"
            options={posizioniDisponibili}
            value={input.posizioneEconomica}
            onChange={e => update({ posizioneEconomica: e.target.value })}
            placeholder="Seleziona..."
          />
          <Input
            label="RIA mensile (€) — art. 74 c.1"
            type="number"
            id="ria"
            value={input.ria ?? ''}
            onChange={e => update({ ria: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
            min={0}
            step={0.01}
            placeholder="0.00"
          />
          <Input
            label="Assegno Personale Non Riassorbibile mensile (€)"
            type="number"
            id="apnr"
            value={input.assegnoPersonaleNonRiassorbibile ?? ''}
            onChange={e => update({ assegnoPersonaleNonRiassorbibile: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
            min={0}
            step={0.01}
            placeholder="0.00"
          />
          {input.area === AreaCCNL.FUNZIONARIO_EQ && (
            <Input
              label="Indennità di Posizione EQ mensile (€) — art. 16 CCNL 2026"
              type="number"
              id="indennitaEQ"
              value={input.indennitaPosizioneEQ ?? ''}
              onChange={e => update({ indennitaPosizioneEQ: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
              min={0}
              step={0.01}
              placeholder="0.00"
            />
          )}
        </div>
      </Card>

      {/* Sezione 3 — Orario di Lavoro */}
      <Card title="3. Orario di Lavoro" isCollapsible defaultCollapsed={false}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4">
          <Select
            label="Tipo orario"
            id="tipoOrario"
            options={OPZIONI_ORARIO}
            value={input.tipoOrario}
            onChange={e => update({ tipoOrario: e.target.value as TipoOrario })}
          />
          {input.tipoOrario === TipoOrario.PART_TIME && (
            <>
              <Input
                label="Percentuale part-time (%)"
                type="number"
                id="percPT"
                value={input.percentualePartTime ?? ''}
                onChange={e => update({ percentualePartTime: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
                min={1}
                max={99}
                step={0.5}
                placeholder="Es. 50"
              />
              <Select
                label="Tipologia part-time — art. 62 CCNL"
                id="tipoPT"
                options={OPZIONI_TIPO_PARTTIME}
                value={input.tipoPartTime ?? TipoPartTime.ORIZZONTALE}
                onChange={e => update({ tipoPartTime: e.target.value as TipoPartTime })}
              />
            </>
          )}
        </div>
      </Card>

      {/* Sezione 4 — Straordinario (solo full-time) */}
      {input.tipoOrario !== TipoOrario.PART_TIME && (
        <Card title="4a. Lavoro Straordinario — Art. 32 CCNL 2019-2021" isCollapsible defaultCollapsed={false}>
          <Select
            label="Modalità di recupero"
            id="modalitaRecupero"
            options={OPZIONI_MODALITA_RECUPERO}
            value={input.modalitaRecuperoStraordinario}
            onChange={e => update({ modalitaRecuperoStraordinario: e.target.value as ModalitaRecuperoStraordinario })}
            containerClassName="mb-4 max-w-sm"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4">
            {([
              [TipoStraordinario.DIURNO, 'Diurno (+15%)'],
              [TipoStraordinario.NOTTURNO, 'Notturno (+30%)'],
              [TipoStraordinario.FESTIVO, 'Festivo (+30%)'],
              [TipoStraordinario.FESTIVO_NOTTURNO, 'Festivo-Notturno (+50%)'],
            ] as [TipoStraordinario, string][]).map(([tipo, label]) => (
              <Input
                key={tipo}
                label={label}
                type="number"
                id={`straord-${tipo}`}
                value={input.orePerStraordinario[tipo] ?? ''}
                onChange={e => update({
                  orePerStraordinario: {
                    ...input.orePerStraordinario,
                    [tipo]: e.target.value === '' ? undefined : parseFloat(e.target.value),
                  }
                })}
                min={0}
                step={0.5}
                placeholder="0"
              />
            ))}
          </div>
        </Card>
      )}

      {/* Sezione 4b — Supplementare (solo part-time) */}
      {input.tipoOrario === TipoOrario.PART_TIME && (
        <Card title="4b. Lavoro Supplementare — Art. 62 CCNL 2019-2021" isCollapsible defaultCollapsed={false}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Input
              label="Ore entro il 25% delle ore concordate (+15%)"
              type="number"
              id="supplEntro25"
              value={input.oreSupplementariEntro25 ?? ''}
              onChange={e => update({ oreSupplementariEntro25: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
              min={0}
              step={0.5}
              placeholder="0"
            />
            <Input
              label="Ore oltre il 25% delle ore concordate (+25%)"
              type="number"
              id="supplOltre25"
              value={input.oreSupplementariOltre25 ?? ''}
              onChange={e => update({ oreSupplementariOltre25: e.target.value === '' ? undefined : parseFloat(e.target.value) })}
              min={0}
              step={0.5}
              placeholder="0"
            />
          </div>
        </Card>
      )}

      {/* Sezione 5 — Turni */}
      <Card title="5. Indennità di Turno — Art. 30 CCNL 2019-2021" isCollapsible defaultCollapsed={false}>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4">
          {([
            [TipoTurno.DIURNO, 'Diurno (+10%)'],
            [TipoTurno.NOTTURNO, 'Notturno (+30%)'],
            [TipoTurno.FESTIVO, 'Festivo (+30%)'],
            [TipoTurno.FESTIVO_NOTTURNO, 'Festivo-Notturno (+50%)'],
            [TipoTurno.FESTIVO_INFRASETTIMANALE, 'Festivo Infrasettimanale (+100%)'],
          ] as [TipoTurno, string][]).map(([tipo, label]) => (
            <Input
              key={tipo}
              label={label}
              type="number"
              id={`turno-${tipo}`}
              value={input.orePerTurno[tipo] ?? ''}
              onChange={e => update({
                orePerTurno: {
                  ...input.orePerTurno,
                  [tipo]: e.target.value === '' ? undefined : parseFloat(e.target.value),
                }
              })}
              min={0}
              step={0.5}
              placeholder="0"
            />
          ))}
        </div>
      </Card>
    </div>
  );
};
