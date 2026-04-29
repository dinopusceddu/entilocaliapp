import React from 'react';
import { getVisibleModules, getModuleAccessInfo } from '../application/registry/moduleRegistry';
import { ArrowRight, LayoutGrid } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { NavigationScope } from '../types';

export const DashboardPage: React.FC = () => {
    const { state, setScopeAndTab } = useAppContext();
    const { currentUser, currentEntity, fundData } = state;

    const handleNavigate = (scope: NavigationScope, tabId: string) => {
        setScopeAndTab(scope, tabId);
    };

    const { hasDirigenza } = fundData.annualData;
    const hasEntity = !!currentEntity;
    
    const modules = getVisibleModules(currentUser, { hasEntity, hasDirigenza })
        .filter(m => m.dashboardColor)
        .map(m => {
            const accessInfo = getModuleAccessInfo(m, currentUser, { hasEntity, hasDirigenza });
            return {
                ...m,
                isDisabled: accessInfo.isDisabled,
                disabledReason: accessInfo.disabledReason
            };
        });

    const isFundDisabled = state.entities.length === 0;

    return (
        <div className="max-w-[1200px] mx-auto py-8 px-4 animate-fade-in">
            {/* Header Section */}
            <div className="mb-10 text-center sm:text-left">
                <h1 className="text-3xl font-bold text-text-light dark:text-white tracking-tight">
                    Benvenuto, <span className="text-primary">{currentUser.name || 'Utente'}</span>
                </h1>
                <p className="text-subtext-light dark:text-subtext-dark mt-2 text-lg">
                    Seleziona l'area di lavoro per iniziare.
                </p>
            </div>

            {/* Dashboard Alerts */}
            {isFundDisabled && (
                <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl flex items-center gap-4 text-amber-800 dark:text-amber-200">
                    <div className="size-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0 text-xl">
                        💡
                    </div>
                    <div>
                        <p className="font-bold">Benvenuto!</p>
                        <p className="text-sm">Per iniziare a configurare il fondo, devi prima creare un ente nella sezione <strong>"Enti e Annualità"</strong>.</p>
                    </div>
                </div>
            )}

            {/* Application Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <div
                        key={module.id}
                        data-testid={`dashboard-card-${module.id}`}
                        onClick={() => !module.isDisabled && handleNavigate(module.scope, module.id)}
                        className={`group bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border transition-all relative overflow-hidden ${module.isDisabled
                            ? 'opacity-60 grayscale cursor-not-allowed border-border-light dark:border-border-dark'
                            : 'hover:border-primary/30 hover:shadow-md cursor-pointer border-border-light dark:border-border-dark'
                            }`}
                    >
                        {!module.isDisabled && (
                            <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${module.dashboardColor}`}></div>
                        )}

                        <div className="flex flex-col h-full">
                            <div className={`size-12 rounded-xl ${module.dashboardColor} bg-opacity-10 flex items-center justify-center mb-4 transition-transform ${!module.isDisabled && 'group-hover:scale-110'} duration-300`}>
                                <module.icon className={`size-6 ${module.textColor}`} />
                            </div>

                            <h3 className="text-xl font-bold text-text-light dark:text-white mb-2 line-flex items-center gap-2">
                                {module.title}
                                {module.isDisabled && <span className="text-xs font-normal text-subtext-light dark:text-subtext-dark opacity-60">(Disabilitato)</span>}
                            </h3>
                            <p className="text-sm text-subtext-light dark:text-subtext-dark mb-6 flex-1 line-clamp-2">
                                {module.isDisabled ? module.disabledReason : module.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                {module.id === 'entityYearManagement' && state.currentEntity && state.currentYear ? (
                                    <div className="flex flex-col gap-1 overflow-hidden">
                                        <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded font-bold uppercase border border-primary/20 truncate" title={state.currentEntity.name}>
                                            {state.currentEntity.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-primary px-1.5 py-0.5 bg-primary/5 rounded border border-primary/10 w-fit whitespace-nowrap">
                                            ESERCIZIO {state.currentYear}
                                        </span>
                                    </div>
                                ) : (
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-opacity-10 ${module.dashboardColor} ${module.textColor}`}>
                                        {module.isDisabled ? 'Richiesto' : module.status}
                                    </span>
                                )}
                                {!module.isDisabled ? (
                                    <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                                        Accedi <ArrowRight className="ml-1 size-4" />
                                    </div>
                                ) : (
                                    <div className="text-xs text-subtext-light dark:text-subtext-dark italic">
                                        Azione richiesta
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions / Future Sections */}
            <div className="mt-12 p-6 bg-gradient-to-r from-background-light to-white dark:from-surface-dark dark:to-background-dark rounded-2xl border border-dashed border-border-light dark:border-border-dark">
                <div className="flex items-center gap-4 text-subtext-light dark:text-subtext-dark text-sm italic">
                    <LayoutGrid size={18} />
                    <span>Puoi tornare qui in qualsiasi momento dal menu laterale.</span>
                </div>
            </div>
        </div>
    );
};
