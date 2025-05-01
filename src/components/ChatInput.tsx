import { FormEvent, useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, X } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200); // Max height 200px
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);

  // Format multi-line messages if needed
  const autoFormatMessage = (input: string): string => {
    const lines = input
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
      
    if (lines.length === 1) {
      return lines[0]; // Single line, return as-is
    }
    
    // Format multi-line input as a list
    return lines.map(line => `• ${line.charAt(0).toUpperCase() + line.slice(1)}`).join('\n');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;
    
    const formatted = autoFormatMessage(message);
    onSendMessage(formatted);
    setMessage('');
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without shift for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative flex items-end rounded-xl border transition-all duration-200 ${
        isFocused 
          ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/10' 
          : 'bg-slate-800/80 border-slate-700 shadow-md'
      }`}
      aria-label="Chat message input"
    >
      {/* Attachment button (visual only) */}
      <button
        type="button"
        className="p-3 text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="Add attachment"
        disabled={isLoading}
      >
        <Paperclip size={18} />
      </button>
      
      {/* Main textarea input */}
      <textarea
        ref={textareaRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
        rows={1}
        disabled={isLoading}
        className="w-full resize-none bg-transparent text-white placeholder-slate-500 focus:outline-none py-3 px-1 max-h-48 overflow-auto text-sm"
        aria-label="Message input field"
      />
      
      {/* Clear button - shows only when there's text */}
      {message.trim() && (
        <button
          type="button"
          onClick={() => setMessage('')}
          className="p-3 text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Clear message"
        >
          <X size={18} />
        </button>
      )}
      
      {/* Voice input button (visual only) */}
      <button
        type="button"
        className="p-3 text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="Voice input"
        disabled={isLoading}
      >
        <Mic size={18} />
      </button>
      
      {/* Send button */}
      <button
        type="submit"
        disabled={!message.trim() || isLoading}
        className={`p-3 flex items-center justify-center rounded-lg transition-all duration-200 ${
          message.trim() && !isLoading
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:shadow-md hover:shadow-blue-500/20 hover:from-blue-600 hover:to-indigo-700'
            : 'bg-slate-700 text-slate-400 cursor-not-allowed'
        }`}
        aria-label="Send message"
      >
        <Send size={18} className={isLoading ? 'opacity-70' : ''} />
      </button>
      
      {/* Character counter - optional feature */}
      {message.length > 0 && (
        <div className="absolute -top-6 right-2 text-xs text-slate-500">
          {message.length} characters
        </div>
      )}
    </form>
  );
};