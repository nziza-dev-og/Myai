import { useState, useEffect } from 'react';

// CSS for typing indicator (should be moved to a separate file)
const typingIndicatorStyles = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-4px); }
  }
  
  .typing-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: currentColor;
    animation: bounce 1.4s infinite ease-in-out;
  }
  
  .typing-dot.delay-200 {
    animation-delay: 0.2s;
  }
  
  .typing-dot.delay-400 {
    animation-delay: 0.4s;
  }
`;

export const TypingIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [pulseEffect, setPulseEffect] = useState(false);
  
  // Create the subtle pulsing effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseEffect(prev => !prev);
    }, 1500);
    
    return () => clearInterval(interval);
  }, []);
  
  // More dramatic fade in/out effect
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 6000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex justify-start mb-5 transition-all duration-1000 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-1'
      }`}
    >
      {/* Add the typing indicator styles */}
      <style>{typingIndicatorStyles}</style>
      
      <div className="flex max-w-[85%] items-start">
        {/* Assistant avatar */}
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          </svg>
        </div>
        
        {/* Typing indicator content */}
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium ml-1 mb-1">
            Assistant
          </span>
          
          <div className={`px-4 py-3 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-md rounded-tl-none transition-all duration-700 ${
            pulseEffect ? 'border-slate-600' : 'border-slate-700'
          }`}>
            <div className="flex space-x-2 h-5 items-center">
              <span className="typing-dot text-blue-400"></span>
              <span className="typing-dot delay-200 text-blue-400"></span>
              <span className="typing-dot delay-400 text-blue-400"></span>
            </div>
          </div>
          
          <span className="text-xs text-slate-500 mt-1 ml-1">
            Thinking...
          </span>
        </div>
      </div>
    </div>
  );
};