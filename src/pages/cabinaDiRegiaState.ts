import { formatCurrency } from '../utils/formatters';

export interface WizardProgress {
  completed: number;
  total: number;
  hasData: boolean;
}

export interface StepState {
  label: string;
  subtitle: string;
  status: 'closed' | 'completed' | 'in-progress' | 'neutral' | 'present' | 'not-started' | 'waiting' | 'available' | 'pending';
  tooltip?: string;
  badgeClass?: string;
}

export interface NextActionState {
  title: string;
  description: string;
  ctaText: string;
  tabId: string;
}

export interface ClosedViewState {
  bannerTitle: string;
  bannerText: string;
  description: string;
  ctaText: string;
  tabId: string;
}

export interface FaseAttualeState {
  phaseNumber: string;
  phaseName: string;
  phaseDesc: string;
}

/**
 * Risolve lo stato del passaggio 1 (Raccolta Dati).
 * In assenza di bozza locale persistita, utilizza la dicitura prudente "— Nessuna bozza locale"
 * con tooltip esplicativo, senza presumere l'inutilizzo assoluto del wizard.
 */
export function resolveRaccoltaState(
  wizardProgress: WizardProgress,
  totaleFondo: number,
  isClosed: boolean
): StepState {
  if (isClosed) {
    return {
      label: '—',
      subtitle: '—',
      status: 'closed',
      tooltip: 'Lo stato storico delle singole fasi non è disponibile.'
    };
  }

  if (wizardProgress.completed >= 8) {
    return {
      label: '✓ Dati completi',
      subtitle: '8/8 passaggi',
      status: 'completed'
    };
  }

  if (wizardProgress.completed > 0) {
    return {
      label: '● In corso',
      subtitle: `${wizardProgress.completed}/8 passaggi`,
      status: 'in-progress'
    };
  }

  if (totaleFondo > 0) {
    return {
      label: '— Nessuna bozza locale',
      subtitle: 'Stato locale',
      status: 'neutral',
      tooltip: 'Su questo dispositivo non è stata rilevata una bozza della raccolta guidata.'
    };
  }

  return {
    label: '○ Da iniziare',
    subtitle: 'Guidata',
    status: 'not-started'
  };
}

/**
 * Risolve lo stato del passaggio 2 (Costituzione).
 * In presenza di importi validi usa "● Dati presenti" (mai "Costituito").
 */
export function resolveCostituzioneState(
  totaleFondo: number,
  isClosed: boolean
): StepState {
  if (isClosed) {
    return {
      label: '—',
      subtitle: '—',
      status: 'closed',
      tooltip: 'Lo stato storico delle singole fasi non è disponibile.'
    };
  }

  if (totaleFondo > 0) {
    return {
      label: '● Dati presenti',
      subtitle: formatCurrency(totaleFondo),
      status: 'present'
    };
  }

  return {
    label: '○ Da compilare',
    subtitle: 'Schede fondi',
    status: 'not-started'
  };
}

/**
 * Risolve lo stato del passaggio 3 (Verifica).
 */
export function resolveVerificaState(
  criticalErrorsCount: number,
  warningsCount: number,
  totaleFondo: number,
  isClosed: boolean
): StepState {
  if (isClosed) {
    return {
      label: '—',
      subtitle: '—',
      status: 'closed',
      tooltip: 'Lo stato storico delle singole fasi non è disponibile.'
    };
  }

  if (criticalErrorsCount > 0) {
    return {
      label: '⚠ Bloccante',
      subtitle: `${criticalErrorsCount} criticità`,
      status: 'in-progress'
    };
  }

  if (warningsCount > 0) {
    return {
      label: '⚠ Attenzioni',
      subtitle: `${warningsCount} avvisi`,
      status: 'in-progress'
    };
  }

  if (totaleFondo > 0) {
    return {
      label: '✓ Superati',
      subtitle: 'Controlli auto',
      status: 'completed'
    };
  }

  return {
    label: '○ Da avviare',
    subtitle: 'Controlli auto',
    status: 'not-started'
  };
}

/**
 * Risolve lo stato del passaggio 4 (Distribuzione).
 * Mai "Distribuito", usa "● In lavorazione" se presente allocazione o "○ Da iniziare".
 */
export function resolveDistribuzioneState(
  hasDistribuzione: boolean,
  totaleFondo: number,
  isClosed: boolean
): StepState {
  if (isClosed) {
    return {
      label: '—',
      subtitle: '—',
      status: 'closed',
      tooltip: 'Lo stato storico delle singole fasi non è disponibile.'
    };
  }

  if (hasDistribuzione) {
    return {
      label: '● In lavorazione',
      subtitle: 'In lavorazione',
      status: 'in-progress'
    };
  }

  if (totaleFondo > 0) {
    return {
      label: '○ Da iniziare',
      subtitle: 'Da iniziare',
      status: 'not-started'
    };
  }

  return {
    label: '○ In attesa',
    subtitle: 'Da ripartire',
    status: 'waiting'
  };
}

/**
 * Risolve lo stato del passaggio 5 (Documenti).
 * In OPEN usa "○ Da predisporre" (mai "Disponibili").
 * In CLOSED usa "● Consultabili".
 */
export function resolveDocumentiState(isClosed: boolean): StepState {
  if (isClosed) {
    return {
      label: '● Consultabili',
      subtitle: 'Report e schede',
      status: 'available'
    };
  }

  return {
    label: '○ Da predisporre',
    subtitle: 'Report e schede',
    status: 'pending'
  };
}

/**
 * Risolve la Next Best Action (Prossima Attività) deterministica.
 * In CLOSED mode, la descrizione NON usa la parola "approvata" e la CTA è "Vai ai documenti →".
 */
export function resolveNextBestAction(params: {
  isClosed: boolean;
  wizardCompleted: number;
  totaleFondo: number;
  criticalErrorsCount: number;
  hasDistribuzione: boolean;
}): NextActionState {
  const { isClosed, wizardCompleted, totaleFondo, criticalErrorsCount, hasDistribuzione } = params;

  if (isClosed) {
    return {
      title: 'Consulta documenti e report',
      description: 'Consulta i prospetti e la documentazione disponibile per questa annualità.',
      ctaText: 'Vai ai documenti →',
      tabId: 'reports'
    };
  }

  if (wizardCompleted >= 6 && totaleFondo === 0) {
    return {
      title: 'Costituisci il Fondo',
      description: 'I dati raccolti sono pronti. Accedi alla costituzione per verificare e consolidare i totali stabili e variabili.',
      ctaText: 'Vai alla costituzione →',
      tabId: 'fondoDipendenti'
    };
  }

  if (criticalErrorsCount > 0) {
    return {
      title: 'Risolvi le criticità rilevate',
      description: `È presente ${criticalErrorsCount} criticità bloccante che richiede verifica per il Fondo.`,
      ctaText: 'Verifica il Fondo →',
      tabId: 'compliance'
    };
  }

  if (totaleFondo > 0 && !hasDistribuzione) {
    return {
      title: 'Distribuisci le risorse del Fondo',
      description: 'Sono presenti i dati economici del Fondo e non risultano criticità bloccanti dai controlli automatici. Procedi alla distribuzione delle risorse.',
      ctaText: 'Vai alla distribuzione →',
      tabId: 'distribuzioneRisorse'
    };
  }

  if (totaleFondo > 0 && hasDistribuzione) {
    return {
      title: 'Distribuzione delle risorse',
      description: 'Sono presenti stanziamenti in corso. Continua la ripartizione e destinazione delle risorse del Fondo.',
      ctaText: 'Continua la distribuzione →',
      tabId: 'distribuzioneRisorse'
    };
  }

  return {
    title: 'Continua la raccolta dati',
    description: wizardCompleted > 0
      ? `Bozza locale su questo dispositivo: ${wizardCompleted} su 8 passaggi.`
      : 'Inizia ad inserire i parametri di base per la costituzione del Fondo.',
    ctaText: 'Continua la raccolta dati →',
    tabId: 'wizard2026Preview'
  };
}

/**
 * Risolve i testi e indicatori per la modalità di visualizzazione CLOSED (sola lettura).
 */
export function resolveClosedViewState(): ClosedViewState {
  return {
    bannerTitle: 'ANNUALITÀ CHIUSA:',
    bannerText: 'Questa annualità è chiusa ed è disponibile in sola lettura.',
    description: 'Consulta i prospetti e la documentazione disponibile per questa annualità.',
    ctaText: 'Vai ai documenti →',
    tabId: 'reports'
  };
}

/**
 * Risolve l'indicatore di fase sintetica per viewport < 1400px.
 */
export function resolveFaseAttuale(params: {
  isClosed: boolean;
  wizardCompleted: number;
  totaleFondo: number;
  criticalErrorsCount: number;
  hasDistribuzione: boolean;
}): FaseAttualeState {
  const { isClosed, wizardCompleted, totaleFondo, criticalErrorsCount, hasDistribuzione } = params;

  if (isClosed) {
    return {
      phaseNumber: '5 di 5',
      phaseName: 'DOCUMENTI & REPORT (CHIUSO)',
      phaseDesc: 'Annualità chiusa · sola lettura'
    };
  }

  if (wizardCompleted < 8 && totaleFondo === 0) {
    return {
      phaseNumber: '1 di 5',
      phaseName: 'RACCOLTA DATI',
      phaseDesc: `${wizardCompleted}/8 passaggi completati`
    };
  }

  if (totaleFondo === 0) {
    return {
      phaseNumber: '2 di 5',
      phaseName: 'COSTITUZIONE',
      phaseDesc: 'Raccolta dati completata, da costituire'
    };
  }

  if (criticalErrorsCount > 0) {
    return {
      phaseNumber: '3 di 5',
      phaseName: 'VERIFICA',
      phaseDesc: `${criticalErrorsCount} criticità da verificare`
    };
  }

  if (hasDistribuzione) {
    return {
      phaseNumber: '4 di 5',
      phaseName: 'DISTRIBUZIONE',
      phaseDesc: 'Distribuzione risorse in corso'
    };
  }

  return {
    phaseNumber: '4 di 5',
    phaseName: 'DISTRIBUZIONE',
    phaseDesc: 'I controlli automatici previsti risultano superati.'
  };
}
