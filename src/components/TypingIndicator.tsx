import { useState, useEffect } from 'react';
import '../TypingIndicator.css';

export const TypingIndicator = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(prev => !prev);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex justify-start mb-4 transition-opacity duration-700 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-70'
      }`}
    >
      <div className="flex max-w-[85%] items-start">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center mr-3 shadow-lg">
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

        <div className="flex flex-col">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1 mb-1">
            Assistant
          </span>
          <div className="px-4 py-3 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-300 dark:bg-gray-800 dark:from-gray-700 dark:to-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl rounded-tl-none">
            <div className="flex space-x-2">
              <span className="typing-dot"></span>
              <span className="typing-dot delay-200"></span>
              <span className="typing-dot delay-400"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
