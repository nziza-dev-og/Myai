import { useState, useEffect, useRef } from 'react';
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
        ...chatState.messages.map((msg) => ({ role: msg.role, content: msg.content })),
        { role: 'user', content },
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
    <div className="flex flex-col h-screen max-w-full mx-auto bg-white dark:bg-gray-950 rounded-none shadow-none overflow-hidden">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-700">
        {chatState.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center gap-6 h-full">
            <img
              src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?fit=crop&w=800&h=600"
              alt="AI Assistant Illustration"
              className="w-full max-w-md rounded-xl border-4 border-blue-600 shadow-md"
            />
            <div>
              <h2 className="text-2xl font-bold">Welcome to AI Assistant</h2>
              <p className="text-gray-500 dark:text-gray-400">Ask me anything and I’ll do my best to help you.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-md">
              {['How can I learn coding?', 'Tell me a fun fact', 'What’s the weather like?', 'Write a short poem'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => handleSendMessage(suggestion)}
                  className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-3 py-2 text-sm rounded-lg text-left transition-colors shadow"
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
              <div className="text-red-500 text-center mt-4">
                ⚠️ Error: {chatState.error}
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 p-4">
        <ChatInput onSendMessage={handleSendMessage} isLoading={chatState.isLoading} />
      </div>
    </div>
  );
};
