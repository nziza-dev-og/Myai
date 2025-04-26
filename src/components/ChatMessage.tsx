import  { MessageCircle, User } from 'lucide-react';
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

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-600 ml-3' : 'bg-slate-700 mr-3'}`}>
          {isUser ? <User size={20} /> : <MessageCircle size={20} />}
        </div>
        <div className="flex flex-col">
          <div className={`px-4 py-3 rounded-2xl ${isUser ? 'message-user rounded-tr-none' : 'message-bot rounded-tl-none'}`}>
            <p className="text-sm">{message.content}</p>
          </div>
          <span className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};
 