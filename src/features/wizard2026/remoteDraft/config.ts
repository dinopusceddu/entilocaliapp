export function isWizard2026RemoteDraftsEnabledForUser({
  userEmail
}: {
  userEmail?: string | null;
}): boolean {
  const globallyEnabled =
    import.meta.env.VITE_ENABLE_WIZARD2026_REMOTE_DRAFTS === 'true';

  if (!globallyEnabled) return false;

  const allowedEmailsRaw =
    import.meta.env.VITE_WIZARD2026_REMOTE_DRAFTS_ALLOWED_EMAILS || '';

  const allowedEmails = allowedEmailsRaw
    .split(',')
    .map((email: string) => email.trim().toLowerCase())
    .filter(Boolean);

  if (allowedEmails.length === 0) return false;

  const normalizedUserEmail = userEmail?.trim().toLowerCase();

  return !!normalizedUserEmail && allowedEmails.includes(normalizedUserEmail);
}
