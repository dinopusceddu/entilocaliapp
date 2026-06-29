import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Pending Draft mock removal safety checks', () => {
  it('1. Il testo "Salva su DB (Mock)" non deve essere presente in App.tsx', () => {
    const appPath = path.resolve(__dirname, '../App.tsx');
    const content = fs.readFileSync(appPath, 'utf-8');
    expect(content).not.toContain('Salva su DB (Mock)');
  });

  it('2. Il banner in App.tsx non deve promettere salvataggi su database', () => {
    const appPath = path.resolve(__dirname, '../App.tsx');
    const content = fs.readFileSync(appPath, 'utf-8');
    expect(content).not.toContain('non ancora salvate sul database');
    expect(content).toContain('Il salvataggio remoto non è al momento disponibile');
  });

  it('3. savePendingDraftRemotely non deve cancellare o pulire le bozze locali', async () => {
    // Verifichiamo direttamente l'implementazione in AppContext.tsx leggendola
    const appContextPath = path.resolve(__dirname, '../contexts/AppContext.tsx');
    const content = fs.readFileSync(appContextPath, 'utf-8');
    
    // Verifichiamo che savePendingDraftRemotely non contenga chiamate distruttive
    // Trova l'implementazione della costante savePendingDraftRemotely
    const saveFnMatch = content.match(/const savePendingDraftRemotely =[\s\S]*?\}\, \[.*?\]\)\;/);
    expect(saveFnMatch).not.toBeNull();
    const saveFnContent = saveFnMatch![0];
    
    expect(saveFnContent).not.toContain('clearLocalDraft');
    expect(saveFnContent).not.toContain('CLEAR_PENDING_DRAFT');
    expect(saveFnContent).toContain('console.warn');
  });
});
