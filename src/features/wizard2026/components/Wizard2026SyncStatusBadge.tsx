import React from 'react';
import { isWizard2026RemoteDraftsEnabledForUser } from '../remoteDraft/config';

export interface Wizard2026SyncStatusBadgeProps {
  status: string;
  isSaving: boolean;
  isOffline: boolean;
  lastSave: string | null;
  onSyncNow?: () => void;
  userEmail?: string | null;
}

export const Wizard2026SyncStatusBadge: React.FC<Wizard2026SyncStatusBadgeProps> = ({
  status,
  isSaving,
  isOffline,
  lastSave,
  onSyncNow,
  userEmail
}) => {
  const isEnabled = isWizard2026RemoteDraftsEnabledForUser({ userEmail });
  if (!isEnabled || status === 'disabled') return null;

  let text = '';
  let colorClass = '';

  if (isOffline || status === 'error') {
    text = 'Sincronizzazione non disponibile';
    colorClass = 'bg-red-50 text-red-700 border-red-200';
  } else if (isSaving) {
    text = 'Salvataggio in corso...';
    colorClass = 'bg-blue-50 text-blue-700 border-blue-200';
  } else {
    switch (status) {
      case 'synced':
        text = lastSave 
          ? `Bozza salvata sul cloud (${new Date(lastSave).toLocaleTimeString()})`
          : 'Bozza salvata sul cloud';
        colorClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        break;
      case 'local_only':
        text = 'Bozza salvata su questo dispositivo';
        colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'local_newer':
        text = 'Bozza locale più recente della bozza cloud';
        colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
        break;
      case 'remote_newer':
        text = 'Bozza cloud più recente';
        colorClass = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        break;
      case 'conflict':
        text = 'Conflitto di sincronizzazione';
        colorClass = 'bg-red-50 text-red-700 border-red-200';
        break;
      default:
        text = 'Bozza salvata su questo dispositivo';
        colorClass = 'bg-amber-50 text-amber-700 border-amber-200';
    }
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border shadow-sm ${colorClass}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse"></span>
      <span>{text}</span>
      {onSyncNow && (status === 'local_newer' || status === 'remote_newer' || status === 'conflict') && (
        <button 
          onClick={onSyncNow}
          className="ml-1.5 hover:underline focus:outline-none opacity-80 hover:opacity-100"
        >
          Sincronizza ora
        </button>
      )}
    </div>
  );
};
