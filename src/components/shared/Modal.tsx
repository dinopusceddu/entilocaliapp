import React, { ReactNode, useLayoutEffect, useRef, useId } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const surfaces: HTMLDialogElement[] = [];
const background = new Map<HTMLElement, { inert: boolean; hadInert: boolean; aria: string | null }>();
let originalOverflow = '';
const restoreBackground = (el: HTMLElement, prior: { inert: boolean; hadInert: boolean; aria: string | null }) => {
    el.inert = prior.inert;
    if (!prior.hadInert) el.removeAttribute('inert');
    if (prior.aria === null) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', prior.aria);
};
const syncBackground = () => {
    const top = surfaces[surfaces.length - 1];
    if (!top) {
        background.forEach((prior, el) => restoreBackground(el, prior));
        background.clear(); document.body.style.overflow = originalOverflow; return;
    }
    for (const el of Array.from(document.body.children) as HTMLElement[]) {
        if (el === top) { const prior = background.get(el); if (prior) restoreBackground(el, prior); continue; }
        if (!background.has(el)) background.set(el, { inert: el.inert, hadInert: el.hasAttribute('inert'), aria: el.getAttribute('aria-hidden') });
        el.inert = true; el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = 'hidden';
};
const focusable = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex]')).filter(el => {
    if (el.tabIndex < 0 || el.matches(':disabled, [hidden], input[type="hidden"]') || el.closest('[hidden], [inert]')) return false;
    for (let p: HTMLElement | null = el; p && p !== root; p = p.parentElement) {
        const css = getComputedStyle(p);
        if (css.display === 'none' || css.visibility === 'hidden') return false;
    }
    return true;
});

/** Shared focus/background behavior; no application workflow or permission logic. */
export function ModalSurface({ children, name, onClose, closeDisabled = false, ...props }: React.HTMLAttributes<HTMLDialogElement> & {
    name?: string; onClose: () => void; closeDisabled?: boolean; children: ReactNode;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    const trigger = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const close = useRef(onClose); close.current = onClose;
    const locked = useRef(closeDisabled); locked.current = closeDisabled;
    useLayoutEffect(() => {
        const dialog = ref.current!;
        if (!surfaces.length) originalOverflow = document.body.style.overflow;
        surfaces.push(dialog);
        syncBackground();
        if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
        const focusFirst = () => {
            const targets = focusable(dialog);
            (targets.find(el => el.hasAttribute('data-autofocus')) ?? targets.find(el => el.matches('input:not([type="checkbox"]):not([type="radio"]), textarea, select')) ?? targets[0] ?? dialog).focus();
        };
        focusFirst();
        const containFocus = (event: FocusEvent) => { if (surfaces[surfaces.length - 1] === dialog && !dialog.contains(event.target as Node)) focusFirst(); };
        const containClick = (event: MouseEvent) => { if (surfaces[surfaces.length - 1] === dialog && !dialog.contains(event.target as Node)) { event.preventDefault(); event.stopImmediatePropagation(); } };
        const keyboard = (event: KeyboardEvent) => {
            if (surfaces[surfaces.length - 1] !== dialog) return;
            if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); if (!locked.current) close.current(); }
            if (event.key === 'Tab') {
                const targets = focusable(dialog), current = document.activeElement;
                if (!targets.length) { event.preventDefault(); dialog.focus(); }
                else if (!dialog.contains(current) || current === dialog || (event.shiftKey ? current === targets[0] : current === targets[targets.length - 1])) {
                    event.preventDefault(); (event.shiftKey ? targets[targets.length - 1] : targets[0]).focus();
                }
            }
        };
        document.addEventListener('focusin', containFocus, true);
        document.addEventListener('click', containClick, true);
        document.addEventListener('keydown', keyboard, true);
        return () => {
            document.removeEventListener('focusin', containFocus, true);
            document.removeEventListener('click', containClick, true);
            document.removeEventListener('keydown', keyboard, true);
            surfaces.splice(surfaces.indexOf(dialog), 1);
            if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open');
            syncBackground();
            const target = trigger.current;
            if (target?.isConnected && !target.matches(':disabled') && !target.closest('[inert]')) target.focus();
            else if (surfaces.length) (focusable(surfaces[surfaces.length - 1])[0] ?? surfaces[surfaces.length - 1]).focus();
            else queueMicrotask(() => {
                // A successful action may replace or disable its original trigger.
                if (!surfaces.length && (!document.activeElement || document.activeElement === document.body)) {
                    focusable(document.body)[0]?.focus();
                }
            });
        };
    }, []);
    useLayoutEffect(() => {
        const dialog = ref.current;
        if (dialog && surfaces[surfaces.length - 1] === dialog && document.activeElement?.matches(':disabled')) {
            (focusable(dialog)[0] ?? dialog).focus();
        }
    }, [closeDisabled]);
    return createPortal(<dialog {...props} ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={name}
        className={`fixed inset-0 m-0 h-full w-full max-h-none max-w-none border-0 bg-transparent p-0 ${props.className ?? ''}`}
        onCancel={event => { event.preventDefault(); if (!locked.current) close.current(); }}>{children}</dialog>, document.body);
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = 'md'
}) => {
    const titleId = useId();
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
    };

    return (
        <ModalSurface onClose={onClose} aria-labelledby={titleId} className="z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">

                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Modal Panel */}
                <div className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 w-full ${sizeClasses[size]}`}>
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                <h3 className="text-lg font-semibold leading-6 text-gray-900" id={titleId}>
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    {children}
                                </div>
                            </div>
                        </div>
                    </div>
                    {(footer) && (
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            {footer}
                        </div>
                    )}
                    {!footer && (
                        <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                            <Button variant="secondary" onClick={onClose}>Chiudi</Button>
                        </div>
                    )}
                </div>
            </div>
        </ModalSurface>
    );
};
