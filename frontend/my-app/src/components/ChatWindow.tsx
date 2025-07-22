'use client';
import { useEffect, useRef } from 'react';

export default function ChatWindow({ messages }: any) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="text-xl font-semibold mb-2">Start a conversation</h2>
          <p>Send a message to begin chatting with the AI assistant.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg: any, index: number) => (
        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] rounded-lg p-4 ${
            msg.role === 'user' 
              ? 'bg-blue-500 text-white' 
              : 'bg-gray-100 text-gray-800 border'
          }`}>
            <div className={`text-xs font-medium mb-2 ${
              msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'
            }`}>
              {msg.role === 'user' ? 'You' : 'Assistant'}
            </div>
            <div className="whitespace-pre-wrap leading-relaxed">
              {msg.content || (msg.role === 'assistant' ? '...' : '')}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}
