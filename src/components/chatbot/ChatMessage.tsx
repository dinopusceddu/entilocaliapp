import React from 'react';
import { User, Bot } from 'lucide-react';
import { Message } from '../../types/chat';

interface ChatMessageProps {
    message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`flex w-full mt-4 space-x-3 max-w-sm ${isUser ? 'ml-auto justify-end' : ''}`}>
            {!isUser && (
                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bot className="h-5 w-5 text-blue-600" />
                </div>
            )}

            <div>
                <div className={`p-3 rounded-lg ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                    <p className="text-sm prose prose-sm max-w-none whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className={`text-xs text-gray-400 leading-none mt-1 block ${isUser ? 'text-right' : ''}`}>
                    {message.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>

            {isUser && (
                <div className="flex-shrink-0 h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                </div>
            )}
        </div>
    );
};
