import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isWizard2026RemoteDraftsEnabledForUser } from '../features/wizard2026/remoteDraft/config';

describe('Wizard 2026 Remote Drafts Config', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('deve disabilitare remote drafts se VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS non è true', () => {
    vi.stubEnv('VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS', 'false');
    vi.stubEnv('VITE_WIZARD2026_REMOTE_DRAFTS_ALLOWED_EMAILS', 'test@example.com');
    
    expect(isWizard2026RemoteDraftsEnabledForUser({ userEmail: 'test@example.com' })).toBe(false);
  });

  it('deve disabilitare remote drafts se la allowlist è vuota', () => {
    vi.stubEnv('VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS', 'true');
    vi.stubEnv('VITE_WIZARD2026_REMOTE_DRAFTS_ALLOWED_EMAILS', '');
    
    expect(isWizard2026RemoteDraftsEnabledForUser({ userEmail: 'test@example.com' })).toBe(false);
  });

  it('deve abilitare remote drafts solo se email utente è nella allowlist', () => {
    vi.stubEnv('VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS', 'true');
    vi.stubEnv('VITE_WIZARD2026_REMOTE_DRAFTS_ALLOWED_EMAILS', 'admin@example.com, test@example.com');
    
    expect(isWizard2026RemoteDraftsEnabledForUser({ userEmail: 'test@example.com' })).toBe(true);
    expect(isWizard2026RemoteDraftsEnabledForUser({ userEmail: 'other@example.com' })).toBe(false);
  });
});
