export interface StateWriteResult { data?: any; version?: string; error: any }
export interface IStateRepository {
  getState(userId: string | undefined, entityId: string, year: number): Promise<{ data: any | null; error: any }>;
  getAvailableYears(userId: string | undefined, entityId: string): Promise<{ data: { current_year: number }[] | null; error: any }>;
  getStateVersions?(entityId: string): Promise<{ data: Record<string, string> | null; error: any }>;
  createState(data: any): Promise<StateWriteResult>;
  upsertState(data: any): Promise<StateWriteResult>;
  deleteState(entityId: string, year: number, expectedVersion?: string): Promise<StateWriteResult>;
  /** Legacy bulk path is disabled by the real adapter. */
  deleteStatesByEntity(entityId: string): Promise<{ error: any }>;
  closeYearAtomic?(params: {
    entityId: string; currentYear: number; closedFundData: any; nextFundData: any;
    currentVersion?: string; nextVersion?: string | null;
  }): Promise<{ data: any; error: any }>;
}
