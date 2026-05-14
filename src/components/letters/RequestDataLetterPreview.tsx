import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface RequestDataLetterPreviewProps {
    markdown: string;
}

export const RequestDataLetterPreview: React.FC<RequestDataLetterPreviewProps> = ({ markdown }) => {
    return (
        <div className="bg-gray-100 p-4 sm:p-8 rounded-xl border border-gray-200 overflow-y-auto max-h-[60vh] shadow-inner">
            <div className="bg-white p-8 sm:p-12 shadow-lg mx-auto max-w-4xl min-h-[29.7cm] text-gray-800 prose prose-sm sm:prose-base lg:prose-lg prose-blue">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {markdown}
                </ReactMarkdown>
            </div>
        </div>
    );
};
