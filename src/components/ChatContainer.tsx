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
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 to-slate-950 text-white overflow-hidden">
      <ChatHeader />

      {/* Main chat area */}
      <div className="flex-1 overflow-y-auto px-4 py-2 md:px-6 scrollbar-thin scrollbar-thumb-slate-600">
        <div className="max-w-4xl mx-auto w-full">
          {chatState.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-8 h-full py-12">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                   d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">Welcome to AI Assistant</h2>
                <p className="text-slate-300 max-w-md">Ask me anything and I'll do my best to help you.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {[
                  'How can I learn coding?', 
                  'Tell me a fun fact', 
                  'What are the best productivity tips?', 
                  'Write a short poem'
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSendMessage(suggestion)}
                    className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 px-4 py-3 rounded-xl text-left transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-blue-900/10 group"
                  >
                    <span className="text-slate-300 group-hover:text-white transition-colors">{suggestion}</span>
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
                <div className="text-center py-4 px-6 bg-red-500/10 border border-red-500/20 rounded-xl my-4">
                  <p className="text-red-400 flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{chatState.error}</span>
                  </p>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Chat input area */}
      <div className="border-t border-slate-800 p-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isLoading={chatState.isLoading} />
        </div>
      </div>
    </div>
  );
};