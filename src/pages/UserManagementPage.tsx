import React, { useState, useEffect } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { supabase } from '../services/supabase';
import { UserRole } from '../enums';
import { AlertCircle, CheckCircle, Shield, User as UserIcon, Key, Trash2, ChevronRight, ChevronDown, Calendar, Database } from 'lucide-react';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { Button } from '../components/shared/Button';
import { Input } from '../components/shared/Input';
import { RagDocumentManager } from '../components/admin/RagDocumentManager';

export const UserManagementPage: React.FC = () => {
    const { state } = useAppContext();
    const [users, setUsers] = useState<any[]>([]);
    const [allEntities, setAllEntities] = useState<any[]>([]);
    const [entityYears, setEntityYears] = useState<Record<string, number[]>>({}); // Map entityId -> years[]
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            // Fetch Users
            const { data: usersData, error: usersError } = await supabase
                .from('user_app_state')
                .select('user_id, email, role, updated_at')
                .order('updated_at', { ascending: false });

            if (usersError) throw usersError;

            // Deduplicate users - keep the most recent (first in DESC list)
            const uniqueUsersMap = new Map();
            usersData?.forEach(item => {
                if (!uniqueUsersMap.has(item.user_id)) {
                    uniqueUsersMap.set(item.user_id, item);
                }
            });
            setUsers(Array.from(uniqueUsersMap.values()));

            // Fetch Entities
            const { data: entitiesData, error: entitiesError } = await supabase
                .from('entities')
                .select('*')
                .order('name');

            if (entitiesError) throw entitiesError;
            setAllEntities(entitiesData || []);

            // Fetch Years for all entities
            const { data: yearsData, error: yearsError } = await supabase
                .from('user_app_state')
                .select('entity_id, current_year');

            if (yearsError) throw yearsError;

            // Group years by entity
            const yearsMap: Record<string, number[]> = {};
            yearsData?.forEach((item: any) => {
                if (item.entity_id) {
                    if (!yearsMap[item.entity_id]) {
                        yearsMap[item.entity_id] = [];
                    }
                    if (!yearsMap[item.entity_id].includes(item.current_year)) {
                        yearsMap[item.entity_id].push(item.current_year);
                    }
                }
            });
            // Sort years
            Object.keys(yearsMap).forEach(key => {
                yearsMap[key].sort((a, b) => b - a);
            });

            setEntityYears(yearsMap);

        } catch (err: any) {
            console.error("Error fetching data:", err);
            setError(`Impossibile caricare i dati. Errore: ${err.message || JSON.stringify(err)}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const toggleExpandUser = (userId: string) => {
        if (expandedUserId === userId) {
            setExpandedUserId(null);
        } else {
            setExpandedUserId(userId);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: UserRole) => {
        setSuccessMessage(null);
        setError(null);
        try {
            const { error } = await supabase
                .from('user_app_state')
                .update({ role: newRole })
                .eq('user_id', userId);

            if (error) throw error;

            setSuccessMessage(`Ruolo aggiornato a ${newRole} per l'utente.`);
            fetchData();
        } catch (err: any) {
            console.error("Error updating role:", err);
            setError("Errore durante l'aggiornamento del ruolo.");
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm("Sei sicuro di voler eliminare questo utente? Questa azione non può essere annullata.")) {
            return;
        }

        setSuccessMessage(null);
        setError(null);
        try {
            const { error } = await supabase
                .from('user_app_state')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;

            setSuccessMessage("Utente eliminato con successo.");
            fetchData();
        } catch (err: any) {
            console.error("Error deleting user:", err);
            setError(`Errore durante l'eliminazione: ${err.message}`);
        }
    };

    const handleDeleteEntity = async (entityId: string) => {
        if (!confirm("Sei sicuro di voler eliminare questo ente? Tutti i dati associati verranno persi.")) return;

        try {
            // Delete associated app state first
            const { error: dataError } = await supabase.from('user_app_state').delete().eq('entity_id', entityId);
            if (dataError) throw dataError;

            // Delete entity
            const { error } = await supabase.from('entities').delete().eq('id', entityId);
            if (error) throw error;

            setSuccessMessage("Ente eliminato con successo.");
            fetchData(); // Refresh both lists to be safe
        } catch (err: any) {
            console.error("Error deleting entity:", err);
            setError(`Errore durante l'eliminazione dell'ente: ${err.message}`);
        }
    };

    const handleDeleteYear = async (entityId: string, year: number) => {
        if (!confirm(`Sei sicuro di voler eliminare l'anno ${year} per questo ente?`)) return;

        try {
            const { error } = await supabase
                .from('user_app_state')
                .delete()
                .eq('entity_id', entityId)
                .eq('current_year', year);

            if (error) throw error;

            setSuccessMessage(`Anno ${year} eliminato con successo.`);
            fetchData();
        } catch (err: any) {
            console.error("Error deleting year:", err);
            setError(`Errore durante l'eliminazione dell'anno: ${err.message}`);
        }
    };

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    const handleCreateUser = () => {
        setShowCreateModal(true);
        setCreateError(null);
        setSuccessMessage(null);
    };

    const submitCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setCreateError(null);

        try {
            // Call Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('create-user', {
                body: {
                    email: newUserEmail,
                    password: newUserPassword,
                    email_confirm: true // Auto-confirm
                }
            });

            if (error) {
                // If the function validates constraints or throws
                throw new Error(error.message || "Errore nella chiamata alla funzione.");
            }

            if (data && data.error) {
                throw new Error(data.error);
            }

            setSuccessMessage(`Utente ${newUserEmail} creato con successo! Ora puoi assegnargli un ruolo.`);
            setShowCreateModal(false);
            setNewUserEmail('');
            setNewUserPassword('');
            fetchData(); // Refresh list to show new user

        } catch (err: any) {
            console.error("Error creating user:", err);
            setCreateError(err.message || "Impossibile creare l'utente. Assicurati che la Edge Function sia distribuita.");
        } finally {
            setIsCreating(false);
        }
    };

    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordUpdateUserId, setPasswordUpdateUserId] = useState<string | null>(null);
    const [passwordUpdateEmail, setPasswordUpdateEmail] = useState('');
    const [newPasswordUpdate, setNewPasswordUpdate] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordUpdateError, setPasswordUpdateError] = useState<string | null>(null);

    const handleOpenPasswordModal = (user: any) => {
        setPasswordUpdateUserId(user.user_id);
        setPasswordUpdateEmail(user.email);
        setNewPasswordUpdate('');
        setPasswordUpdateError(null);
        setShowPasswordModal(true);
    };

    const submitUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingPassword(true);
        setPasswordUpdateError(null);

        try {
            const { data, error } = await supabase.functions.invoke('update-password', {
                body: {
                    targetUserId: passwordUpdateUserId,
                    newPassword: newPasswordUpdate
                }
            });

            if (error) throw new Error(error.message || "Errore nella chiamata alla funzione.");
            if (data && data.error) throw new Error(data.error);

            setSuccessMessage(`Password aggiornata per ${passwordUpdateEmail}`);
            setShowPasswordModal(false);
        } catch (err: any) {
            console.error("Error updating password:", err);
            setPasswordUpdateError(err.message || "Impossibile aggiornare la password.");
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (state.currentUser.role !== UserRole.ADMIN) {
        return (
            <div className="flex justify-center items-center h-full text-red-600">
                <AlertCircle className="mr-2" />
                Accesso Negato. Solo gli amministratori possono visualizzare questa pagina.
            </div>
        );
    }

    return (
        <div className="space-y-6 relative">
            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-lg font-bold text-gray-900">Nuovo Utente</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>

                        <form onSubmit={submitCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <Input
                                    value={newUserEmail}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserEmail(e.target.value)}
                                    type="email"
                                    required
                                    placeholder="email@esempio.it"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <Input
                                    value={newUserPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserPassword(e.target.value)}
                                    type="password"
                                    required
                                    placeholder="password123"
                                    minLength={6}
                                />
                            </div>

                            {createError && (
                                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                    {createError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={isCreating}
                                >
                                    Annulla
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isCreating}
                                >
                                    Crea Utente
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="text-lg font-bold text-gray-900">Cambia Password</h3>
                            <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                            Aggiorna la password per l'utente <strong>{passwordUpdateEmail}</strong>.
                        </p>

                        <form onSubmit={submitUpdatePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nuova Password</label>
                                <Input
                                    value={newPasswordUpdate}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPasswordUpdate(e.target.value)}
                                    type="password"
                                    required
                                    placeholder="Nuova password sicura"
                                    minLength={6}
                                />
                            </div>

                            {passwordUpdateError && (
                                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                                    {passwordUpdateError}
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setShowPasswordModal(false)}
                                    disabled={isUpdatingPassword}
                                >
                                    Annulla
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isUpdatingPassword}
                                >
                                    Aggiorna Password
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center border-b border-[#f3e7e8] pb-4">
                <div>
                    <h2 className="text-[#1b0e0e] text-2xl font-bold leading-tight">Gestione Utenti</h2>
                    <p className="text-[#5f5252] mt-1">Gestisci i ruoli, i permessi ed gli enti degli utenti.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleCreateUser} variant="primary" size="sm">
                        + Nuovo Utente
                    </Button>
                    <Button onClick={fetchData} variant="secondary" size="sm">
                        Aggiorna Lista
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    {successMessage}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center">
                    <LoadingSpinner text="Caricamento dati..." />
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email / User ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ultimo Accesso</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruolo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => {
                                const userEntities = allEntities.filter(e => e.user_id === user.user_id);
                                const isExpanded = expandedUserId === user.user_id;

                                return (
                                    <React.Fragment key={user.user_id}>
                                        <tr className={isExpanded ? "bg-gray-50" : ""}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <button
                                                    onClick={() => toggleExpandUser(user.user_id)}
                                                    className="text-gray-500 hover:text-gray-700 focus:outline-none transition-transform duration-200"
                                                    title={isExpanded ? "Chiudi dettagli" : "Mostra enti"}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-5 h-5" />
                                                    ) : (
                                                        <ChevronRight className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900">{user.email || 'N/A'}</span>
                                                    <span className="text-xs text-gray-500 font-mono">{user.user_id}</span>
                                                </div>
                                                {user.user_id === state.currentUser.id && <span className="mt-1 inline-flex text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Tu</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.updated_at).toLocaleDateString()} {new Date(user.updated_at).toLocaleTimeString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2 items-center">
                                                {/* Change Password Action - For Self AND Others */}
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => handleOpenPasswordModal(user)}
                                                    className="text-blue-600 hover:text-blue-900 mr-1"
                                                    title="Cambia Password"
                                                >
                                                    <div className="flex items-center">
                                                        <Key className="w-3 h-3 mr-1" /> Pwd
                                                    </div>
                                                </Button>

                                                {/* Actions */}
                                                {user.role !== UserRole.ADMIN ? (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleUpdateRole(user.user_id, UserRole.ADMIN)}
                                                        className="text-purple-600 hover:text-purple-900"
                                                    >
                                                        <Shield className="w-3 h-3 mr-1" /> Promuovi
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => handleUpdateRole(user.user_id, UserRole.GUEST)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                        disabled={user.user_id === state.currentUser.id} // Prevent demoting yourself
                                                    >
                                                        <UserIcon className="w-3 h-3 mr-1" /> Retrocedi
                                                    </Button>
                                                )}

                                                {/* Delete Action - Only enable for others */}
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    // Variant 'danger' implies red, but we use secondary for now to avoid custom variant errors unless implemented
                                                    // Actually let's try a red style if possible or just secondary with red text
                                                    onClick={() => handleDeleteUser(user.user_id)}
                                                    className="text-red-600 hover:text-red-900 ml-2"
                                                    disabled={user.user_id === state.currentUser.id}
                                                >
                                                    Elimina
                                                </Button>
                                            </td>
                                        </tr>
                                        {/* Expanded Row for Entities */}
                                        {isExpanded && (
                                            <tr className="bg-gray-50 border-t border-gray-100">
                                                <td colSpan={5} className="px-6 py-4">
                                                    <div className="ml-8 border-l-2 border-gray-200 pl-4">
                                                        <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                                                            <Database className="w-4 h-4 mr-2" />
                                                            Enti Gestiti ({userEntities.length})
                                                        </h4>
                                                        {userEntities.length > 0 ? (
                                                            <div className="space-y-4">
                                                                {userEntities.map(entity => {
                                                                    const years = entityYears[entity.id] || [];
                                                                    return (
                                                                        <div key={entity.id} className="bg-white border rounded-lg p-4 shadow-sm">
                                                                            <div className="flex justify-between items-center mb-3">
                                                                                <h5 className="font-semibold text-gray-800 text-lg">{entity.name}</h5>
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="secondary"
                                                                                    className="text-red-600 hover:text-red-800 border-red-200 hover:bg-red-50"
                                                                                    onClick={() => handleDeleteEntity(entity.id)}
                                                                                >
                                                                                    <Trash2 className="w-4 h-4 mr-1" /> Elimina Ente
                                                                                </Button>
                                                                            </div>

                                                                            {/* Years List */}
                                                                            <div className="bg-gray-50 rounded p-3">
                                                                                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                                                                    <Calendar className="w-3 h-3 mr-1" /> Anni ({years.length})
                                                                                </div>
                                                                                {years.length > 0 ? (
                                                                                    <div className="flex flex-wrap gap-2">
                                                                                        {years.map(year => (
                                                                                            <div key={year} className="inline-flex items-center bg-white border border-gray-300 rounded-md px-2 py-1 text-sm shadow-sm group">
                                                                                                <span className="font-medium text-gray-700">{year}</span>
                                                                                                <button
                                                                                                    onClick={() => handleDeleteYear(entity.id, year)}
                                                                                                    className="ml-2 text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                                    title={`Elimina anno ${year}`}
                                                                                                >
                                                                                                    <Trash2 className="w-3 h-3" />
                                                                                                </button>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-sm text-gray-500 italic">Nessun dato annuale salvato.</span>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        ) : (
                                                            <p className="text-sm text-gray-500 italic">Nessun ente creato da questo utente.</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <RagDocumentManager />
        </div>
    );
};
