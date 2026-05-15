import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

export type ValidationStatus = 'success' | 'warning' | 'error' | 'info';

export interface ValidationItem {
    id: string;
    title: string;
    description: string;
    status: ValidationStatus;
}

interface WizardValidationPanelProps {
    title: string;
    items: ValidationItem[];
}

export const WizardValidationPanel: React.FC<WizardValidationPanelProps> = ({ title, items }) => {
    
    const renderIcon = (status: ValidationStatus) => {
        switch (status) {
            case 'success': return <CheckCircle className="text-green-500 shrink-0" size={20} />;
            case 'warning': return <AlertCircle className="text-amber-500 shrink-0" size={20} />;
            case 'error': return <XCircle className="text-red-500 shrink-0" size={20} />;
            case 'info': return <Info className="text-blue-500 shrink-0" size={20} />;
        }
    };

    const getBgColor = (status: ValidationStatus) => {
        switch (status) {
            case 'success': return 'bg-green-50 border-green-100';
            case 'warning': return 'bg-amber-50 border-amber-100';
            case 'error': return 'bg-red-50 border-red-100';
            case 'info': return 'bg-blue-50 border-blue-100';
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">{title}</h3>
            <div className="space-y-3">
                {items.map(item => (
                    <div key={item.id} className={`p-4 rounded-lg border flex gap-4 ${getBgColor(item.status)}`}>
                        {renderIcon(item.status)}
                        <div>
                            <h4 className="font-semibold text-gray-900 text-sm mb-1">{item.title}</h4>
                            <p className="text-sm text-gray-700">{item.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
