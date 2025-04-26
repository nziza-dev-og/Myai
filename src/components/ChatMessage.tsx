import { MessageCircle, User, Copy, Check } from 'lucide-react';
import { Message } from '../types';
import { useState, useEffect, useRef } from 'react';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(message.timestamp));

  const [showMessage, setShowMessage] = useState(false);
  const [copied, setCopied] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  const parts = message.content.split(/```([\s\S]*?)```/g);
  const isLongMessage = message.content.length > 300;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
    }, 200); // Delay to simulate a "pulse" appearance
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = async () => {
    if (messageRef.current) {
      // Find all the <code> or <pre> elements in the message
      const codeBlocks = messageRef.current.querySelectorAll('code, pre');
      
      if (codeBlocks.length > 0) {
        let codeText = '';
        codeBlocks.forEach(block => {
          codeText += block.innerText + '\n'; // Append each code block's content
        });

        try {
          await navigator.clipboard.writeText(codeText.trim()); // Copy code text to clipboard
          setCopied(true);
          setTimeout(() => setCopied(false), 1500); // Reset copied state after 1.5 seconds
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      }
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}>
        <div
          className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-lg
            ${isUser ? 'bg-gradient-to-br from-blue-500 to-blue-700 ml-3' : 'bg-gradient-to-br from-gray-600 to-gray-800 mr-3'}`}
        >
          {isUser ? <User size={20} className="text-white" /> : <MessageCircle size={20} className="text-white" />}
        </div>

        <div className="flex flex-col">
          <div
            className={`text-xs font-semibold mb-2 ${isUser ? 'text-right mr-1' : 'text-left ml-1'} text-gray-400`}
          >
            {isUser ? 'You' : 'Assistant'}
          </div>

          <div
            ref={messageRef}
            className={`relative group px-5 py-4 rounded-xl shadow-lg whitespace-pre-wrap transition-all duration-500
              ${showMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              ${isUser
                ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'}`}
          >
            {showMessage && (
              <div className={`text-base leading-relaxed ${isLongMessage ? 'line-clamp-6' : ''}`}>
                {parts.map((part, idx) =>
                  idx % 2 === 0 ? (
                    <span key={idx}>{part}</span>
                  ) : (
                    <pre
                      key={idx}
                      className="bg-gray-900 text-green-400 p-4 rounded-xl my-3 overflow-x-auto text-sm font-mono"
                    >
                      <code>{part.trim()}</code>
                    </pre>
                  )
                )}
              </div>
            )}

            {!isUser && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                title="Copy code"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            )}
          </div>

          <div className={`flex items-center mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span className="text-xs text-gray-400">{formattedTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
