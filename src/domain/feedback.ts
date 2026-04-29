import { FeedbackType, FeedbackStatus } from './enums';

export interface AppFeedback {
  id: string;
  created_at: string;
  user_id: string;
  user_name: string;
  type: FeedbackType;
  title: string;
  description: string;
  status: FeedbackStatus;
  admin_notes?: string;
}
