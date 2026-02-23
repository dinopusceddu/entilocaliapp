import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatWindow } from './ChatWindow';

export const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="w-80 md:w-96 h-[500px] mb-4 transition-all duration-300 ease-in-out transform origin-bottom-right">
                    <ChatWindow onClose={() => setIsOpen(false)} />
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform hover:scale-110 flex items-center justify-center transform origin-bottom-right"
                    aria-label="Apri chat"
                >
                    <MessageCircle size={28} />
                </button>
            )}
        </div>
    );
};
