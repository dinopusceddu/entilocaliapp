export interface IUserRepository {
  getUserRole(userId: string): Promise<{ data: string | null; error: any }>;
}
