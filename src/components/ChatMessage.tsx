'use client';

import { MessageCircle, User, ClipboardCopy, Check } from 'lucide-react';
import { useState } from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(message.timestamp));

  const [copiedCodeBlock, setCopiedCodeBlock] = useState<number | null>(null);

  // Handle copy for code blocks
  const handleCopy = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeBlock(index);
      setTimeout(() => setCopiedCodeBlock(null), 1500);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  // Format the AI response
  const formatBotResponse = (content: string) => {
    const sections = content.split(/(?=```)/g); // Split when code block starts

    return (
      <div className="space-y-4">
        {sections.map((section, index) => {
          if (section.startsWith('```')) {
            const code = section.replace(/```[a-z]*\n?/, '').replace(/```$/, '');

            return (
              <div key={index} className="relative group">
                {/* Copy button */}
                <button
                  onClick={() => handleCopy(code, index)}
                  className="absolute top-2 right-2 bg-slate-600 hover:bg-slate-500 text-white p-1 rounded-md transition opacity-0 group-hover:opacity-100"
                  title={copiedCodeBlock === index ? 'Copied!' : 'Copy'}
                >
                  {copiedCodeBlock === index ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <ClipboardCopy size={16} />
                  )}
                </button>

                {/* Code Block */}
                <pre className="bg-slate-800 text-slate-100 rounded-xl p-4 overflow-x-auto text-xs">
                  <code>{code}</code>
                </pre>
              </div>
            );
          } else {
            return (
              <div key={index} className="text-sm space-y-2">
                {formatContent(section)}
              </div>
            );
          }
        })}
      </div>
    );
  };

  // Format regular text (headings, lists, bold)
  const formatContent = (text: string) => {
    const lines = text.split('\n');
    const formattedLines: JSX.Element[] = [];

    lines.forEach((line, i) => {
      if (line.startsWith('## ')) {
        formattedLines.push(
          <h3 key={i} className="font-bold text-blue-400 text-base">{line.replace('## ', '')}</h3>
        );
      } else if (/^[-*]\s/.test(line)) {
        formattedLines.push(
          <li key={i} className="list-disc list-inside text-slate-300">{line.replace(/^[-*]\s/, '')}</li>
        );
      } else if (line.trim() !== '') {
        formattedLines.push(
          <p key={i} className="text-slate-300">{formatBoldText(line)}</p>
        );
      }
    });

    return <div className="space-y-1">{formattedLines}</div>;
  };

  // Format bold text inside sentences
  const formatBoldText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={index} className="font-semibold">{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600 ml-3' : 'bg-slate-700 mr-3'}`}>
          {isUser ? <User size={20} /> : <MessageCircle size={20} />}
        </div>
        <div className="flex flex-col">
          <div className={`px-4 py-3 rounded-2xl ${isUser ? 'bg-blue-500 text-white rounded-tr-none' : 'bg-slate-700 text-white rounded-tl-none'}`}>
            {isUser ? (
              <p className="text-sm">{message.content}</p>
            ) : (
              formatBotResponse(message.content)
            )}
          </div>
          <span className="text-xs text-gray-400 mt-1">
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};
