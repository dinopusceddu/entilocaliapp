import { IUserRepository } from './ports/IUserRepository';
import { UserRole, AppAction } from '../types.ts';

/**
 * Workflow per caricare il ruolo globale dell'utente autenticato.
 * Questo workflow è indipendente dall'ente selezionato e garantisce 
 * che i permessi amministrativi siano corretti nello stato globale.
 */
export const fetchUserRoleWorkflow = async (
  deps: { userRepository: IUserRepository },
  currentUser: any,
  dispatch: React.Dispatch<AppAction>
) => {
  if (!currentUser?.id) return;


  try {
    const { data, error } = await deps.userRepository.getUserRole(currentUser.id);

    if (error) {
      console.error('Errore nel recupero del ruolo utente:', error);
      dispatch({ type: 'SET_USER', payload: { ...currentUser, role: UserRole.GUEST } });
      return;
    }

    dispatch({
      type: 'SET_USER',
      payload: {
        ...currentUser,
        role: typeof data === 'string' && [...Object.values(UserRole), 'USER'].includes(data)
          ? (data as UserRole)
          : UserRole.GUEST
      }
    });

  } catch (err) {
    console.error('Eccezione nel workflow fetchUserRole:', err);
    dispatch({ type: 'SET_USER', payload: { ...currentUser, role: UserRole.GUEST } });
  }
};
