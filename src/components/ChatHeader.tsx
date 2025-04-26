import  { MessageSquare, Info, Settings } from 'lucide-react';
import { useState } from 'react';

export const ChatHeader = () => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="border-b border-slate-700 pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-blue-600 p-2 rounded-lg mr-3">
            <MessageSquare size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Assistant</h1>
            <p className="text-sm text-gray-400">How can I help you today?</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="p-2 hover:bg-slate-700 rounded-full" 
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <button 
            className="p-2 hover:bg-slate-700 rounded-full" 
            title="About"
            onClick={() => setShowInfo(!showInfo)}
          >
            <Info size={20} />
          </button>
        </div>
      </div>
      
      {showInfo && (
        <div className="mt-4 p-4 bg-slate-900 rounded-lg text-sm">
          <h3 className="font-medium mb-2">About this AI Assistant</h3>
          <p className="text-gray-300 mb-2">
            This AI Assistant uses OpenAI's technology to provide helpful, accurate, and friendly responses to your questions.
          </p>
          <p className="text-gray-400">
            Your conversation is processed securely through our API. Type your questions in the input field below to get started.
          </p>
        </div>
      )}
    </div>
  );
};
 