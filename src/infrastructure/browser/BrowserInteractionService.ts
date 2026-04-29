import { IInteractionService } from '../../application/ports/IInteractionService';

export class BrowserInteractionService implements IInteractionService {
  confirm(message: string): boolean {
    return window.confirm(message);
  }

  alert(message: string): void {
    window.alert(message);
  }

  reload(): void {
    window.location.reload();
  }
}
