export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    createdAt: Date;
}

export interface ChatResponse {
    answer: string;
    sources?: { title: string; metadata: any }[];
    error?: string;
}
