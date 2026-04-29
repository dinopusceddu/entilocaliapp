import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchUserRoleWorkflow } from '../userWorkflow';
import { UserRole } from '../../enums';

describe('fetchUserRoleWorkflow', () => {
  const mockDispatch = vi.fn();
  const mockUserRepository = {
    getUserRole: vi.fn(),
    getAll: vi.fn(),
    updateRole: vi.fn(),
    deleteUser: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should dispatch SET_USER with correct role when fetching succeeds', async () => {
    mockUserRepository.getUserRole.mockResolvedValue({ data: UserRole.ADMIN, error: null });

    await fetchUserRoleWorkflow(
      { userRepository: mockUserRepository },
      { id: 'user-123', email: 'test@test.it', name: 'test@test.it' },
      mockDispatch
    );

    expect(mockUserRepository.getUserRole).toHaveBeenCalledWith('user-123');
    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_USER',
      payload: expect.objectContaining({
        id: 'user-123',
        role: UserRole.ADMIN
      })
    });
  });

  it('should use GUEST role if repository returns no data', async () => {
    mockUserRepository.getUserRole.mockResolvedValue({ data: null, error: null });

    await fetchUserRoleWorkflow(
      { userRepository: mockUserRepository },
      { id: 'user-456' },
      mockDispatch
    );

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'SET_USER',
      payload: expect.objectContaining({
        role: UserRole.GUEST
      })
    });
  });

  it('should not dispatch anything if there is an error', async () => {
    mockUserRepository.getUserRole.mockResolvedValue({ data: null, error: { message: 'Database error' } });
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await fetchUserRoleWorkflow(
      { userRepository: mockUserRepository },
      { id: 'user-789' },
      mockDispatch
    );

    expect(mockDispatch).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
