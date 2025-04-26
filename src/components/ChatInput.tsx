import { FormEvent, useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const autoFormatMessage = (input: string): string => {
    const lines = input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (lines.length === 1) {
      return lines[0]; // Single line, return as-is
    }

    return lines.map(line => `• ${line.charAt(0).toUpperCase() + line.slice(1)}`).join('\n');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    const formatted = autoFormatMessage(message);
    onSendMessage(formatted);
    setMessage('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-end bg-slate-800 rounded-xl border border-slate-700 px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 transition-all"
      aria-label="Chat message input"
    >
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message... (Line breaks will auto-format)"
        rows={1}
        disabled={isLoading}
        className="w-full resize-none bg-transparent text-white placeholder-gray-400 focus:outline-none py-2 pr-3 max-h-48 overflow-auto"
        aria-label="Message input field"
      />

      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className="ml-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Send message"
      >
        <Send size={18} />
      </button>
    </form>
  );
};
