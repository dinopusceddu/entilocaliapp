// src/pages/DashboardPage.tsx
import React from 'react';
import { Users, ArrowRight, LayoutGrid, Calculator, MessageCircle, Settings } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';
import { NavigationScope } from '../types';
import { UserRole } from '../enums';

export const DashboardPage: React.FC = () => {
    const { state, setScopeAndTab } = useAppContext();
    const { currentUser } = state;

    const handleNavigate = (scope: NavigationScope, tabId: string) => {
        setScopeAndTab(scope, tabId);
    };

    const modules = [
        {
            id: 'gestione-enti',
            scope: NavigationScope.DASHBOARD,
            tabId: 'entityYearManagement',
            title: 'Enti e Annualità',
            description: 'Creazione enti, gestione anni e attivazione contesto di lavoro.',
            icon: Settings,
            color: 'bg-orange-500',
            textColor: 'text-orange-600',
            status: 'Nuovo',
            adminOnly: false
        },
        {
            id: 'fondo',
            scope: NavigationScope.FONDO,
            tabId: 'home',
            title: 'Configurazione Fondo',
            description: 'Gestione risorse, personale e calcolo del fondo decentrato.',
            icon: Calculator,
            color: 'bg-blue-500',
            textColor: 'text-blue-600',
            status: 'Attivo',
            adminOnly: false
        },
        {
            id: 'comunicazioni',
            scope: NavigationScope.COMUNICAZIONI,
            tabId: 'messages',
            title: 'Comunicazioni',
            description: 'Messaggi interni, notifiche e sistema di feedback.',
            icon: MessageCircle,
            color: 'bg-emerald-500',
            textColor: 'text-emerald-600',
            status: 'Attivo',
            adminOnly: false
        },
        {
            id: 'utenti',
            scope: NavigationScope.ADMIN,
            tabId: 'userManagement',
            title: 'Gestione Utenti',
            description: 'Amministrazione profili, permessi e accessi di sistema.',
            icon: Users,
            color: 'bg-purple-500',
            textColor: 'text-purple-600',
            status: 'Attivo',
            adminOnly: true
        },
    ].filter(m => !m.adminOnly || currentUser.role === UserRole.ADMIN);

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

            {/* Application Tiles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <div
                        key={module.id}
                        onClick={() => handleNavigate(module.scope, module.tabId)}
                        className="group bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-border-light dark:border-border-dark hover:border-primary/30 hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-5 group-hover:opacity-10 transition-opacity ${module.color}`}></div>

                        <div className="flex flex-col h-full">
                            <div className={`size-12 rounded-xl ${module.color} bg-opacity-10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110 duration-300`}>
                                <module.icon className={`size-6 ${module.textColor}`} />
                            </div>

                            <h3 className="text-xl font-bold text-text-light dark:text-white mb-2">{module.title}</h3>
                            <p className="text-sm text-subtext-light dark:text-subtext-dark mb-6 flex-1 line-clamp-2">
                                {module.description}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-opacity-10 ${module.color} ${module.textColor}`}>
                                    {module.status}
                                </span>
                                <div className="flex items-center text-primary font-medium text-sm group-hover:translate-x-1 transition-transform">
                                    Accedi <ArrowRight className="ml-1 size-4" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions / Future Sections */}
            <div className="mt-12 p-6 bg-gradient-to-r from-background-light to-white dark:from-surface-dark dark:to-background-dark rounded-2xl border border-dashed border-border-light dark:border-border-dark">
                <div className="flex items-center gap-4 text-subtext-light dark:text-subtext-dark text-sm italic">
                    <LayoutGrid size={18} />
                    <span>Area di atterraggio centrale. Puoi tornare qui in qualsiasi momento dal menu laterale.</span>
                </div>
            </div>
        </div>
    );
};
