export interface AppMessage {
    id: string;
    user_id: string | null; // null if broadcast to everyone
    title: string;
    content: string;
    author_id: string | null;
    created_at: string;
    is_read?: boolean; // Hydrated from message_reads
}

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    link?: string | null;
    author_id: string | null;
    created_at: string;
    is_read?: boolean; // Hydrated from notification_reads
}
