import React from 'react';
import { BookOpen, FileText, Search, List as ListIcon, MessageSquare } from 'lucide-react';
import { useAppContext } from '../../contexts/AppContext';

export const NormativaHomePage: React.FC = () => {
  const { dispatch } = useAppContext();

  const navigateTo = (tabId: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in text-text-light dark:text-text-dark">
      {/* Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-blue-900 to-primary-dark overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply border-white/10" />
        <div className="relative z-10 px-8 py-16 md:py-20 lg:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Esplora la Normativa
            </h1>
            <p className="text-lg md:text-xl text-blue-100/90 font-medium">
              L'hub unificato per consultare in modo interattivo la Raccolta Sistematica del CCNL Funzioni Locali, la Guida al Contratto e l'archivio dei pareri ARAN associati.
            </p>
          </div>
          <div className="hidden md:block bg-white/10 p-6 rounded-2xl backdrop-blur-md border border-white/20">
            <BookOpen size={80} className="text-blue-100 opacity-90" />
          </div>
        </div>
      </div>

      {/* Grid Menu */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        <DashboardCard 
          title="Raccolta Sistematica" 
          description="Consulta tutti gli articoli del CCNL coordinato in un formato di lettura pulito e ricercabile."
          icon={<BookOpen size={36} />}
          colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          onClick={() => navigateTo('raccoltaSistematica')}
        />

        <DashboardCard 
          title="Guida al Contratto" 
          description="Le note esplicative e le schede tematiche di approfondimento, con riferimenti chiari e commenti."
          icon={<FileText size={36} />}
          colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
          onClick={() => navigateTo('guidaContratto')}
        />

        <DashboardCard 
          title="Ricerca Unificata" 
          description="Testo pieno e parole chiave su tutto il volume normativo, con highlight immediati dei match."
          icon={<Search size={36} />}
          colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          onClick={() => navigateTo('ricercaNormativa')}
        />

        <DashboardCard 
          title="Indice Analitico" 
          description="Trova gli articoli partendo dalle definizioni chiave raggruppate in ordine alfabetico."
          icon={<ListIcon size={36} />}
          colorClass="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          onClick={() => navigateTo('indiceAnalitico')}
        />

        <DashboardCard 
          title="Pareri ARAN" 
          description="Archivio strutturato dei quesiti più comuni e dei chiarimenti ufficiali emessi dall'ARAN."
          icon={<MessageSquare size={36} />}
          colorClass="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
          onClick={() => navigateTo('pareriAran')}
        />

      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  onClick: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, description, icon, colorClass, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-surface-dark border border-border-light dark:border-border-dark rounded-2xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.06)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
    >
      <div className={`p-4 rounded-xl shrink-0 self-start mb-5 ${colorClass}`}>
        {icon}
      </div>
      <div>
        <h3 className="text-xl font-bold text-text-light dark:text-text-dark mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-subtext-light dark:text-subtext-dark leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
