import { Entity } from '../../types';
export interface IEntityRepository {
  getAll(userId?: string): Promise<{ data: Entity[] | null; error: any }>;
  create(name: string, userId: string): Promise<{ data: Entity | null; error: any }>;
  update(id: string, name: string): Promise<{ error: any }>;
  delete(id: string, expectedVersions?: Record<string, string>): Promise<{ data?: any; error: any }>;
}
