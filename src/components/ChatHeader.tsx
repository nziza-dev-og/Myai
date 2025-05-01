import { MessageSquare, Info, Settings, Moon, Sun, X } from 'lucide-react';
import { useState } from 'react';

export const ChatHeader = () => {
  const [showInfo, setShowInfo] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  return (
    <header className="border-b border-slate-800 px-4 py-3 sticky top-0 backdrop-blur-md bg-slate-900/80 z-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg mr-3 shadow-lg shadow-blue-500/20">
              <MessageSquare size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                AI Assistant
              </h1>
              <p className="text-xs text-slate-400">Powered by advanced language models</p>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Toggle theme"
              title={darkMode ? "Light mode" : "Dark mode"}
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <Sun size={18} className="text-slate-400 hover:text-slate-200 transition-colors" />
              ) : (
                <Moon size={18} className="text-slate-400 hover:text-slate-200 transition-colors" />
              )}
            </button>
            
            <button
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Open settings"
              title="Settings"
            >
              <Settings size={18} className="text-slate-400 hover:text-slate-200 transition-colors" />
            </button>
            
            <button
              className={`p-2 rounded-lg transition-colors ${
                showInfo ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
              aria-label="Toggle assistant info"
              title="About"
              onClick={() => setShowInfo(!showInfo)}
            >
              {showInfo ? (
                <X size={18} />
              ) : (
                <Info size={18} />
              )}
            </button>
          </div>
        </div>
        
        {/* Info panel */}
        {showInfo && (
          <div className="mt-3 p-4 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 text-sm shadow-lg transition-all duration-300 ease-in-out">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <Info size={16} className="text-blue-400" />
                <span>About this AI Assistant</span>
              </h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <p className="text-slate-300">
                This assistant uses advanced language models to help you get answers, ideas, and assistance in real time.
              </p>
              <p className="text-slate-400">
                Your inputs are securely processed and handled with care. Conversations are not stored beyond your current session.
              </p>
              <div className="flex items-center gap-2 mt-3 text-xs">
                <span className="inline-flex items-center px-2 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                  Online
                </span>
                <span className="text-slate-500">Model: GPT-4</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};