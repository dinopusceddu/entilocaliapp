// components/shared/Input.tsx
import React from 'react';
import { MonetaryInput } from './MonetaryInput';
import { monetaryPolicyForControl } from '../../domain/monetaryBoundary';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  monetaryPath?: string;
  label?: string;
  error?: string;
  warning?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  inputContainerClassName?: string; // For wrapper around input and potential icons
  inputInfo?: string | React.ReactNode;
}

export const Input: React.FC<InputProps> = React.memo(({
  label,
  id: suppliedId,
  error,
  warning,
  type = 'text',
  containerClassName = '',
  labelClassName = '',
  inputClassName = '',
  inputContainerClassName = '',
  inputInfo,
  monetaryPath,
  ...props
}) => {
  const generatedId = React.useId();
  const id = suppliedId ?? generatedId;
  const Control = type === 'number' && (monetaryPath || monetaryPolicyForControl(props.name ?? id)) ? MonetaryInput : 'input';
  const baseInputClass = `form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#1b0e0e] border-none bg-[#f3e7e8] h-12 md:h-14 placeholder:text-[#994d51] p-3 md:p-4 text-base font-normal leading-normal focus:ring-2 focus:ring-[#ea2832]/50 focus:outline-none read-only:bg-gray-200 read-only:cursor-not-allowed disabled:bg-gray-200 disabled:cursor-not-allowed`;

  const errorClass = 'ring-2 ring-red-500 bg-[#fee2e2] focus:ring-red-500';
  const warningClass = 'ring-1 ring-amber-500 focus:ring-amber-500';

  const validationClass = error ? errorClass : warning ? warningClass : '';

  const describedByIds = [
    props['aria-describedby'],
    inputInfo && id ? `${id}-info` : undefined,
    error && id ? `${id}-error` : undefined,
    !error && warning && id ? `${id}-warning` : undefined,
  ].filter(Boolean).join(' ');


  return (
    <div className={`mb-4 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className={`block text-base font-medium text-[#1b0e0e] pb-2 ${labelClassName}`}>
          {label}
        </label>
      )}
      <div className={`relative ${inputContainerClassName}`}>
        <Control
          {...(Control === MonetaryInput ? { monetaryPath } : {})}
          type={type}
          id={id}
          className={`${baseInputClass} ${validationClass} ${inputClassName}`}
          {...props}
          aria-invalid={!!error || (props['aria-invalid'] ?? false)}
          aria-describedby={describedByIds || undefined}
        />
      </div>
      {inputInfo && id && <p id={`${id}-info`} className="mt-1 text-xs text-[#5f5252]">{inputInfo}</p>}
      {error && id && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && warning && id && <p id={`${id}-warning`} className="mt-1 text-xs text-amber-700">{warning}</p>}
    </div>
  );
});
