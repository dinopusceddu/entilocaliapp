import React from 'react';
import { Check } from 'lucide-react';

export interface Step {
  id: number;
  title: string;
}

interface WizardStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick: (stepId: number) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({ steps, currentStep, onStepClick }) => {
  return (
    <nav aria-label="Progress">
      <ol className="flex flex-wrap items-center justify-between w-full gap-4">
        {steps.map((step, stepIdx) => (
          <li key={step.id} className="relative flex-1">
            {step.id < currentStep ? (
              <button
                onClick={() => onStepClick(step.id)}
                className="group flex w-full items-center"
              >
                <span className="flex items-center px-2 py-4 text-sm font-medium">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 group-hover:bg-blue-800">
                    <Check className="h-5 w-5 text-white" aria-hidden="true" />
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-900 hidden lg:block">{step.title}</span>
                </span>
              </button>
            ) : step.id === currentStep ? (
              <div className="flex items-center px-2 py-4 text-sm font-medium" aria-current="step">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-blue-600 bg-white">
                  <span className="text-blue-600 font-bold">{step.id}</span>
                </span>
                <span className="ml-4 text-sm font-bold text-blue-600 hidden lg:block">{step.title}</span>
              </div>
            ) : (
              <button
                disabled={true} // Disable clicking future steps for now
                className="group flex items-center"
              >
                <span className="flex items-center px-2 py-4 text-sm font-medium">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-gray-300 bg-white group-hover:border-gray-400">
                    <span className="text-gray-500 font-bold">{step.id}</span>
                  </span>
                  <span className="ml-4 text-sm font-medium text-gray-500 hidden lg:block">{step.title}</span>
                </span>
              </button>
            )}
            
            {stepIdx !== steps.length - 1 && (
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-4 h-0.5 bg-gray-200 hidden lg:block" />
            )}
          </li>
        ))}
      </ol>
      {/* Mobile view title */}
      <div className="lg:hidden mt-2 px-2">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Step {currentStep}: {steps[currentStep-1].title}</span>
      </div>
    </nav>
  );
};
