import React, { createContext, useContext, useEffect, useId, useState } from 'react';
import { defaultMonetaryPolicy, monetaryPolicyForControl, parseMonetaryValue, type MonetaryIssue } from '../../domain/monetaryBoundary';

/** Form-local invalid drafts never enter economic state or persistence. */
export const MonetaryDraftContext = createContext<(key: string, issue?: MonetaryIssue) => void>(() => {});
export const MonetaryDraftIssuesContext = createContext<readonly MonetaryIssue[]>([]);
export interface MonetaryInputProps extends React.InputHTMLAttributes<HTMLInputElement> { monetaryPath?: string }
export function MonetaryInput({ monetaryPath, value, onChange, id, 'aria-describedby': describedBy, ...props }: MonetaryInputProps) {
  const generatedId = useId();
  const inputId = id ?? `money-${generatedId}`;
  const policy = monetaryPolicyForControl(monetaryPath ?? props.name ?? id) ?? { ...defaultMonetaryPolicy, path: monetaryPath ?? props.name ?? id ?? inputId };
  const [draft, setDraft] = useState<string | undefined>();
  const [draftIssue, setDraftIssue] = useState<MonetaryIssue>();
  const register = useContext(MonetaryDraftContext);
  const incoming = parseMonetaryValue(value, policy, policy.path);
  const error = draftIssue ?? (incoming.status === 'INVALID' ? incoming.issue : undefined);
  useEffect(() => { register(generatedId, draftIssue); return () => register(generatedId); }, [register, generatedId, draftIssue]);
  useEffect(() => { setDraft(undefined); setDraftIssue(undefined); }, [value]);
  const errorId = `${inputId}-money-error`;
  const unitId = `${inputId}-unit`;
  return <>
    <input {...props} id={inputId} type="text" inputMode="decimal"
      value={draft ?? value ?? ''} aria-invalid={!!error || (props['aria-invalid'] ?? false)}
      aria-describedby={[describedBy, unitId, error ? errorId : undefined].filter(Boolean).join(' ')}
      onChange={event => {
        const raw = event.target.value;
        const parsed = parseMonetaryValue(raw, policy, policy.path);
        setDraft(raw);
        if (parsed.status === 'INVALID') { setDraftIssue(parsed.issue); register(generatedId, parsed.issue); return; }
        setDraftIssue(undefined); register(generatedId);
        const normalized = parsed.status === 'MISSING' ? '' : String(parsed.value);
        // Existing handlers receive only a canonical numeric string or a real blank.
        onChange?.({ ...event, target: { ...event.target, name: props.name ?? '', type: 'number', value: normalized },
          currentTarget: { ...event.currentTarget, value: normalized } } as React.ChangeEvent<HTMLInputElement>);
      }} />
    <span id={unitId} className="sr-only">Importo in euro, massimo due decimali.</span>
    {error && <p id={errorId} role="alert" className="mt-1 text-xs text-red-600">{error.message}</p>}
  </>;
}
