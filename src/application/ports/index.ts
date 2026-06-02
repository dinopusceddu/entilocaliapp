import { IEntityRepository } from './IEntityRepository';
import { IStateRepository } from './IStateRepository';
import { IUserRepository } from './IUserRepository';
import { IInteractionService } from './IInteractionService';


export * from './IEntityRepository';
export * from './IStateRepository';
export * from './IUserRepository';
export * from './IInteractionService';
export * from './IWizard2026DraftRepository';

export interface WorkflowDependencies {
  entityRepository: IEntityRepository;
  stateRepository: IStateRepository;
  userRepository: IUserRepository;
  interactionService: IInteractionService;
}
