export interface IInteractionService {
  confirm(message: string): Promise<boolean> | boolean;
  alert(message: string): void;
  reload(): void;
}
