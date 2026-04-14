import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext.tsx';
import { useAuth } from '../../contexts/AuthContext.tsx';
import { Button } from '../shared/Button.tsx';
import { Modal } from '../shared/Modal.tsx';
import { Input } from '../shared/Input.tsx';
import { supabase } from '../../services/supabase';
import { LogOut, Key, Bell, Mail, ChevronDown } from 'lucide-react';
import { NavigationScope } from '../../types.ts';
import { APP_NAME } from '../../constants.ts';

interface HeaderProps {
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { state, setScopeAndTab } = useAppContext();
  const { currentUser } = state;
  const { signOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState<any[]>([]);
  const [unreadMsgsCount, setUnreadMsgsCount] = useState(0);
  const [isNotifsModalOpen, setIsNotifsModalOpen] = useState(false);
  const { dispatch } = useAppContext();
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (currentUser?.id) {
      fetchCommsData();
    }
  }, [currentUser?.id]);

  const fetchCommsData = async () => {
    try {
      // Fetch unread notifications
      const { data: allNotifs } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
      const { data: readNotifs } = await supabase.from('notification_reads').select('notification_id').eq('user_id', currentUser.id);
      const readNotifIds = new Set(readNotifs?.map(r => r.notification_id));
      const unreadN = (allNotifs || []).filter(n => !readNotifIds.has(n.id));
      setUnreadNotifs(unreadN);

      // Fetch unread messages
      const { data: allMsgs } = await supabase.from('messages').select('id, user_id');
      const { data: readMsgs } = await supabase.from('message_reads').select('message_id').eq('user_id', currentUser.id);
      const readMsgIds = new Set(readMsgs?.map(r => r.message_id));
      const unreadM = (allMsgs || []).filter(m => (m.user_id === null || m.user_id === currentUser.id) && !readMsgIds.has(m.id));
      setUnreadMsgsCount(unreadM.length);
    } catch (err) {
      console.error("Error fetching comms data", err);
    }
  };

  const handleMarkNotifAsRead = async (notifId: string) => {
    try {
      await supabase.from('notification_reads').insert({ notification_id: notifId, user_id: currentUser.id });
      setUnreadNotifs(prev => prev.filter(n => n.id !== notifId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllNotifsAsRead = async () => {
    // Inseriamo massivamente per tutte le non lette
    const inserts = unreadNotifs.map(n => ({ notification_id: n.id, user_id: currentUser.id }));
    if (inserts.length > 0) {
      try {
        await supabase.from('notification_reads').insert(inserts);
        setUnreadNotifs([]);
      } catch (e) {
        console.error(e);
      }
    }
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Le password non coincidono');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('La password deve essere di almeno 6 caratteri');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess('Password aggiornata con successo');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setIsChangingPassword(false), 2000);
    } catch (err: any) {
      setPasswordError(err.message || 'Errore durante l\'aggiornamento della password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };


  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <header className="bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Context */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="text-subtext-light hover:text-text-light focus:outline-none md:hidden"
                aria-label="Toggle sidebar"
              >
                <span className="material-icons">menu</span>
              </button>

              <div
                className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setScopeAndTab(NavigationScope.DASHBOARD, 'dashboard')}
              >
                <img src="/logo.png" alt="FP CGIL Lombardia" className="h-12 w-auto object-contain" />
                <div className="h-8 w-px bg-border-light dark:border-border-dark hidden sm:block"></div>
                <div>
                  <h1 className="text-sm font-semibold text-text-light dark:text-white leading-tight">{APP_NAME}</h1>
                  <p className="text-xs text-subtext-light dark:text-subtext-dark">FP CGIL Lombardia</p>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-3">
              <div className="ml-4 flex items-center gap-2 relative" ref={menuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-background-light dark:hover:bg-background-dark transition-all border border-transparent hover:border-border-light dark:hover:border-border-dark"
                  title={`Menu utente: ${currentUser.name}`}
                >
                  <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm relative">
                    {getUserInitials(currentUser.name)}
                    {(unreadNotifs.length > 0 || unreadMsgsCount > 0) && (
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 border-2 border-surface-light dark:border-surface-dark rounded-full animate-pulse"></span>
                    )}
                  </div>
                  <ChevronDown className={`w-4 h-4 text-subtext-light transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-surface-light dark:bg-surface-dark rounded-xl shadow-xl border border-border-light dark:border-border-dark py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-border-light dark:border-border-dark mb-1">
                      <p className="text-sm font-semibold text-text-light dark:text-text-dark truncate">{currentUser.name}</p>
                      <p className="text-xs text-subtext-light dark:text-subtext-dark truncate">{currentUser.email}</p>
                      <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                        {currentUser.role}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsChangingPassword(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                    >
                      <Key className="w-4 h-4 text-subtext-light" />
                      <span>Cambia Password</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsNotifsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                    >
                      <Bell className="w-4 h-4 text-subtext-light" />
                      <div className="flex-1 flex items-center justify-between">
                        <span>Notifiche</span>
                        {unreadNotifs.length > 0 && (
                          <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadNotifs.length}</span>
                        )}
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        dispatch({ type: 'SET_ACTIVE_TAB', payload: 'messages' });
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-background-dark transition-colors"
                    >
                      <Mail className="w-4 h-4 text-subtext-light" />
                      <div className="flex-1 flex items-center justify-between">
                        <span>Messaggi ricevuti</span>
                        {unreadMsgsCount > 0 && (
                          <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadMsgsCount}</span>
                        )}
                      </div>
                    </button>

                    <div className="my-1 border-t border-border-light dark:border-border-dark"></div>

                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-primary/5 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modal Cambio Password */}
      <Modal
        isOpen={isChangingPassword}
        onClose={() => setIsChangingPassword(false)}
        title="Cambia Password"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Nuova Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Almeno 6 caratteri"
            required
          />
          <Input
            label="Conferma Nuova Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ripeti la password"
            required
          />

          {passwordError && (
            <div className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded border border-red-200 dark:border-red-800">
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
              {passwordSuccess}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsChangingPassword(false)}
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
      </Modal>

      {/* Modal Notifiche */}
      <Modal
        isOpen={isNotifsModalOpen}
        onClose={() => setIsNotifsModalOpen(false)}
        title="Centro Notifiche"
      >
        <div className="max-h-[60vh] overflow-y-auto space-y-3 p-1">
          {unreadNotifs.length === 0 ? (
            <p className="text-gray-500 text-center py-6">Non hai nuove notifiche.</p>
          ) : (
            <>
              <div className="flex justify-end mb-2">
                <button onClick={handleMarkAllNotifsAsRead} className="text-xs text-primary hover:underline">
                  Segna tutte come lette
                </button>
              </div>
              {unreadNotifs.map(n => (
                <div key={n.id} className="bg-red-50 border border-red-100 p-3 rounded-lg relative pr-8">
                  <h4 className="font-semibold text-sm text-gray-900">{n.title}</h4>
                  <p className="text-sm text-gray-700 mt-1">{n.message}</p>
                  {n.link && (
                    <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                      Vedi dettagli
                    </a>
                  )}
                  <button
                    onClick={() => handleMarkNotifAsRead(n.id)}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-700"
                    title="Segna come letta"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </>
          )}
        </div>
        </div>
      </Modal>
    </>
  );
};
