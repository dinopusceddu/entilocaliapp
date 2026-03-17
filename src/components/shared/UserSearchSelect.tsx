import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, User, Users, ChevronDown, X } from 'lucide-react';

interface UserOption {
    id: string;
    email: string;
}

interface UserSearchSelectProps {
    users: UserOption[];
    selectedUserId: string;
    onSelect: (userId: string) => void;
    label?: string;
    placeholder?: string;
}

export const UserSearchSelect: React.FC<UserSearchSelectProps> = ({
    users,
    selectedUserId,
    onSelect,
    label,
    placeholder = "Cerca utente per email..."
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const filteredUsers = useMemo(() => {
        const lowerSearch = searchTerm.toLowerCase();
        return users.filter(u => u.email.toLowerCase().includes(lowerSearch));
    }, [users, searchTerm]);

    const selectedUser = useMemo(() => {
        if (selectedUserId === 'all') return { id: 'all', email: 'Tutti gli utenti (Globale)' };
        return users.find(u => u.id === selectedUserId);
    }, [users, selectedUserId]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    return (
        <div className="space-y-1.5 relative" ref={wrapperRef}>
            {label && <label className="block text-sm font-bold text-slate-700">{label}</label>}
            
            <div 
                className={`w-full flex items-center justify-between rounded-xl border-slate-200 shadow-sm bg-slate-50 p-3 border transition-all cursor-pointer hover:border-primary/50 ${isOpen ? 'ring-2 ring-primary/20 border-primary' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center gap-2 overflow-hidden">
                    {selectedUserId === 'all' ? (
                        <Users className="w-4 h-4 text-purple-500 shrink-0" />
                    ) : (
                        <User className="w-4 h-4 text-blue-500 shrink-0" />
                    )}
                    <span className="text-sm text-slate-700 truncate">
                        {selectedUser ? selectedUser.email : 'Seleziona destinatario'}
                    </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[60] mt-1 w-full bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                autoFocus
                                type="text"
                                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border-none rounded-lg focus:ring-0"
                                placeholder={placeholder}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            {searchTerm && (
                                <button 
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-md"
                                    onClick={(e) => { e.stopPropagation(); setSearchTerm(''); }}
                                >
                                    <X className="w-3 h-3 text-slate-500" />
                                </button>
                            )}
                        </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        <div
                            className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${selectedUserId === 'all' ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50'}`}
                            onClick={() => { onSelect('all'); setIsOpen(false); setSearchTerm(''); }}
                        >
                            <Users className="w-4 h-4 text-purple-500" />
                            <span className="text-sm font-medium">📢 Tutti gli utenti (Globale)</span>
                        </div>

                        {filteredUsers.length > 0 && <div className="h-px bg-slate-50 my-1 mx-2"></div>}

                        {filteredUsers.map((user: UserOption) => (
                            <div
                                key={user.id}
                                className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors ${selectedUserId === user.id ? 'bg-primary/10 text-primary' : 'hover:bg-slate-50'}`}
                                onClick={() => { onSelect(user.id); setIsOpen(false); setSearchTerm(''); }}
                            >
                                <User className="w-4 h-4 text-blue-500" />
                                <span className="text-sm">{user.email}</span>
                            </div>
                        ))}

                        {filteredUsers.length === 0 && searchTerm && (
                            <div className="p-4 text-center text-slate-400 text-sm italic">
                                Nessun utente trovato per "{searchTerm}"
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
