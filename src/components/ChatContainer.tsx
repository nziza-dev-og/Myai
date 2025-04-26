import  { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatHeader } from './ChatHeader';
import { TypingIndicator } from './TypingIndicator';
import { fetchChatResponse } from '../api';

import { Message, ChatState } from '../types';

export const ChatContainer = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages, chatState.isLoading]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setChatState((prev) => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const apiMessages = [
        { role: 'system', content: 'You are a helpful, friendly, and concise assistant.' },
        ...chatState.messages.map(msg => ({ 
          role: msg.role, 
          content: msg.content 
        })),
        { role: 'user', content }
      ];

      const responseContent = await fetchChatResponse(apiMessages);

      const assistantMessage: Message = {
        id: uuidv4(),
        content: responseContent,
        role: 'assistant',
        timestamp: new Date(),
      };

      setChatState((prev) => ({
        ...prev,
        messages: [...prev.messages, assistantMessage],
        isLoading: false,
      }));
    } catch (error) {
      setChatState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      }));
    }
  };

  return (
    <div className="flex flex-col h-full max-w-3xl mx-auto">
      <ChatHeader />
      
      <div className="flex-1 overflow-y-auto py-4 scrollbar">
        {chatState.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <img 
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixid=M3w3MjUzNDh8MHwxfHNlYXJjaHwxfHxkaWdpdGFsJTIwYXNzaXN0YW50JTIwYWklMjBpbnRlcmZhY2UlMjB0ZWNobm9sb2d5fGVufDB8fHx8MTc0NTY1NzY2NXww&ixlib=rb-4.0.3&fit=fillmax&h=600&w=800" 
              alt="AI Assistant"
              className="w-full max-w-md rounded-xl mb-6 border-4 border-blue-600"
            />
            <h2 className="text-2xl font-bold mb-2">Welcome to AI Assistant</h2>
            <p className="text-gray-400 mb-6">Ask me anything and I'll do my best to help you.</p>
            <div className="grid grid-cols-2 gap-2 w-full max-w-md">
              {["How can I learn coding?", "Tell me a fun fact", "What's the weather like?", "Write a short poem"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSendMessage(suggestion)}
                  className="bg-slate-800 hover:bg-slate-700 rounded-lg px-3 py-2 text-sm text-left transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chatState.messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {chatState.isLoading && <TypingIndicator />}
            {chatState.error && (
              <div className="text-red-500 text-center py-2">
                Error: {chatState.error}
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="mt-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={chatState.isLoading} />
      </div>
    </div>
  );
};
 