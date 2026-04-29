export interface IStateRepository {
  getState(userId: string | undefined, entityId: string, year: number): Promise<{ data: any | null; error: any }>;
  getAvailableYears(userId: string | undefined, entityId: string): Promise<{ data: { current_year: number }[] | null; error: any }>;
  createState(data: any): Promise<{ error: any }>;
  upsertState(data: any): Promise<{ error: any }>;
  deleteState(entityId: string, year: number): Promise<{ error: any }>;
  deleteStatesByEntity(entityId: string): Promise<{ error: any }>;
}
