import { MessageSquare, Info, Settings } from 'lucide-react';
import { useState } from 'react';

export const ChatHeader = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <header className="border-b border-slate-700 pb-4 mb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-600 p-2 rounded-lg mr-3 shadow-md">
            <MessageSquare size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Assistant</h1>
            <p className="text-sm text-gray-400">How can I help you today?</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Open settings"
            title="Settings"
          >
            <Settings size={20} className="text-gray-300" />
          </button>
          <button
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Toggle assistant info"
            title="About"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info size={20} className="text-gray-300" />
          </button>
        </div>
      </div>

      {showInfo && (
        <div className="mt-4 p-4 bg-slate-800 rounded-lg text-sm transition-all duration-300 ease-in-out">
          <h3 className="font-semibold text-white mb-2">About this AI Assistant</h3>
          <p className="text-gray-300 mb-2">
            This assistant uses OpenAI's language model to help you get answers, ideas, and assistance in real time.
          </p>
          <p className="text-gray-400">
            Your inputs are securely sent to our API and responded to with AI-generated messages. Let’s start a conversation!
          </p>
        </div>
      )}
    </header>
  );
};
