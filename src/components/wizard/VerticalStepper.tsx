import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

export interface Step {
    id: number;
    title: string;
    description: string;
}

interface VerticalStepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick: (stepId: number) => void;
    className?: string;
}

export const VerticalStepper: React.FC<VerticalStepperProps> = ({
    steps,
    currentStep,
    onStepClick,
    className = '',
}) => {
    return (
        <nav aria-label="Progress" className={className}>
            <ol role="list" className="overflow-hidden">
                {steps.map((step, stepIdx) => (
                    <li key={step.title} className={`relative ${stepIdx !== steps.length - 1 ? 'pb-10' : ''}`}>
                        {stepIdx !== steps.length - 1 ? (
                            <div
                                className={`absolute top-4 left-4 -ml-px h-full w-0.5 ${step.id < currentStep ? 'bg-primary' : 'bg-gray-200'
                                    }`}
                                aria-hidden="true"
                            />
                        ) : null}
                        <button
                            onClick={() => onStepClick(step.id)}
                            className="group relative flex items-start w-full text-left"
                            aria-current={step.id === currentStep ? 'step' : undefined}
                        >
                            <span className="flex h-9 items-center">
                                <span className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white group-hover:bg-gray-50 transition">
                                    {step.id < currentStep ? (
                                        <CheckCircle2 className="h-full w-full text-primary" aria-hidden="true" />
                                    ) : step.id === currentStep ? (
                                        <span className="h-8 w-8 rounded-full border-2 border-primary bg-white flex items-center justify-center">
                                            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                                        </span>
                                    ) : (
                                        <span className="h-8 w-8 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center group-hover:border-gray-400">
                                            <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                                        </span>
                                    )}
                                </span>
                            </span>
                            <span className="ml-4 flex min-w-0 flex-col">
                                <span
                                    className={`text-sm font-semibold tracking-wide ${step.id === currentStep ? 'text-primary' : 'text-gray-500'
                                        }`}
                                >
                                    {step.title}
                                </span>
                                <span className="text-sm text-gray-500">{step.description}</span>
                            </span>
                            {step.id === currentStep && (
                                <ChevronRight className="ml-auto h-5 w-5 text-gray-400 self-center hidden sm:block" />
                            )}
                        </button>
                    </li>
                ))}
            </ol>
        </nav>
    );
};
