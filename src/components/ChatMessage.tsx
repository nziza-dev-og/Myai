'use client';

import { MessageCircle, User, ClipboardCopy, Check, ThumbsUp } from 'lucide-react';
import { useState } from 'react';

// Define message type
const Message = {
  role: 'user' || 'assistant',
  content: '',
  timestamp: new Date(),
};

// Main component
export default function EnhancedChat() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome! I'm your coding assistant. How can I help you today?`,
      timestamp: new Date(Date.now() - 900000),
    },
    {
      role: 'user',
      content: 'Can you explain how React hooks work?',
      timestamp: new Date(Date.now() - 600000),
    },
    {
      role: 'assistant',
      content: `Hooks are a feature in React that let you use state and other React features without writing a class component.

## Main React Hooks

- **useState**: Lets you add state to functional components
- **useEffect**: Handles side effects like data fetching or DOM updates
- **useContext**: Accesses context data without prop drilling

Here's a simple example:

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`

Remember that hooks can only be called at the top level of your component!`,
      timestamp: new Date(Date.now() - 500000),
    },
    {
      role: 'user',
      content: 'Thanks! Can you show me how to use useEffect?',
      timestamp: new Date(Date.now() - 300000),
    },
    {
      role: 'assistant',
      content: `The \`useEffect\` hook lets you perform side effects in functional components.

## Basic useEffect Syntax

\`\`\`jsx
useEffect(() => {
  // Side effect code here
  
  return () => {
    // Optional cleanup function
  };
}, [dependencies]);
\`\`\`

Here's a practical example that fetches data:

\`\`\`jsx
import React, { useState, useEffect } from 'react';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Define an async function
    async function fetchUser() {
      try {
        setLoading(true);
        const response = await fetch('https://api.example.com/user');
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    }
    
    // Call the function
    fetchUser();
    
    // Cleanup function (runs when component unmounts)
    return () => {
      // Cancel any pending requests, clear timers, etc.
      console.log('Component unmounted');
    };
  }, []); // Empty dependency array means this runs once on mount
  
  if (loading) return <p>Loading...</p>;
  if (!user) return <p>No user data</p>;
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}
\`\`\``,
      timestamp: new Date(Date.now() - 120000),
    },
  ]);

  return (
    <div className="flex flex-col h-screen bg-slate-900">
      <header className="bg-slate-800 p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold text-white">Chat Interface</h1>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, idx) => (
            <ChatMessage key={idx} message={message} />
          ))}
        </div>
      </div>
      
      <footer className="bg-slate-800 p-4 border-t border-slate-700">
        <div className="max-w-4xl mx-auto flex">
          <input 
            type="text" 
            placeholder="Type a message..." 
            className="flex-1 bg-slate-700 text-white rounded-l-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-r-lg transition-colors">
            Send
          </button>
        </div>
      </footer>
    </div>
  );
}

// Chat Message Component
function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(message.timestamp));

  const [copiedCodeBlock, setCopiedCodeBlock] = useState(null);
  const [liked, setLiked] = useState(false);

  // Handle copy for code blocks
  const handleCopy = async (code, index) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeBlock(index);
      setTimeout(() => setCopiedCodeBlock(null), 1500);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  // Apply syntax highlighting to code blocks
  const formatCodeWithSyntaxHighlighting = (code, language) => {
    // Basic syntax highlighting function
    const tokenize = (code, language) => {
      // Define patterns for different code elements based on language
      const patterns = {
        // Keywords
        keywords: {
          jsx: /\b(import|export|from|function|const|let|var|return|if|for|while|class|extends|new|this|useState|useEffect|null|undefined|true|false)\b/g,
          js: /\b(import|export|from|function|const|let|var|return|if|for|while|class|extends|new|this|null|undefined|true|false)\b/g,
          default: /\b(function|const|let|var|return|if|for|while|class|new|this)\b/g
        },
        // Strings
        strings: /(["'`])(\\?.)*?\1/g,
        // Comments
        comments: /\/\/.*|\/\*[\s\S]*?\*\//g,
        // Numbers
        numbers: /\b\d+\.?\d*\b/g,
        // JSX specific
        jsx_tags: /<\/?[a-zA-Z][a-zA-Z0-9]*|\/>/g,
        // Function calls
        functions: /\b([a-zA-Z][a-zA-Z0-9]*)\(/g,
        // React hooks
        react_hooks: /\b(use[A-Z][a-zA-Z]*)\b/g,
      };
      
      // Choose language patterns
      const langPatterns = language === 'jsx' || language === 'js' ? patterns.keywords[language] : patterns.keywords.default;
      
      // Replace code with highlighted spans
      let highlightedCode = code;
      
      // Handle comments first to avoid conflicts
      highlightedCode = highlightedCode.replace(patterns.comments, match => 
        `<span class="text-slate-400">${match}</span>`
      );
      
      // Handle strings
      highlightedCode = highlightedCode.replace(patterns.strings, match => 
        `<span class="text-yellow-300">${match}</span>`
      );
      
      // Handle JSX tags for JSX language
      if (language === 'jsx') {
        highlightedCode = highlightedCode.replace(patterns.jsx_tags, match => 
          `<span class="text-blue-300">${match}</span>`
        );
        
        // React hooks
        highlightedCode = highlightedCode.replace(patterns.react_hooks, match => 
          `<span class="text-purple-400">${match}</span>`
        );
      }
      
      // Handle keywords
      highlightedCode = highlightedCode.replace(langPatterns, match => 
        `<span class="text-pink-400">${match}</span>`
      );
      
      // Handle numbers
      highlightedCode = highlightedCode.replace(patterns.numbers, match => 
        `<span class="text-green-300">${match}</span>`
      );
      
      // Handle function calls - must be after keywords
      highlightedCode = highlightedCode.replace(patterns.functions, match => {
        // Extract just the function name without the opening parenthesis
        const funcName = match.substring(0, match.length - 1);
        return `<span class="text-blue-400">${funcName}</span>(`;
      });
      
      return { __html: highlightedCode };
    };

    return <div dangerouslySetInnerHTML={tokenize(code, language)} />;
  };

  // Format the response
  const formatResponse = (content) => {
    const sections = content.split(/(?=```)/g); // Split when code block starts

    return (
      <div className="space-y-4">
        {sections.map((section, index) => {
          if (section.startsWith('```')) {
            const language = section.match(/```([a-z]*)\n?/)?.[1] || '';
            const code = section.replace(/```[a-z]*\n?/, '').replace(/```$/, '');

            return (
              <div key={index} className="relative group">
                {/* Language label */}
                {language && (
                  <div className="absolute top-0 left-3 px-2 py-0.5 bg-slate-700 text-xs text-slate-300 rounded-b-md">
                    {language}
                  </div>
                )}
                
                {/* Copy button */}
                <button
                  onClick={() => handleCopy(code, index)}
                  className="absolute top-2 right-2 bg-slate-600 hover:bg-slate-500 text-white p-1.5 rounded-md transition opacity-0 group-hover:opacity-100"
                  title={copiedCodeBlock === index ? 'Copied!' : 'Copy'}
                >
                  {copiedCodeBlock === index ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <ClipboardCopy size={16} />
                  )}
                </button>

                {/* Code Block with Syntax Highlighting */}
                <pre className="bg-slate-800 text-slate-100 rounded-xl p-5 pt-7 overflow-x-auto text-sm mt-2 border border-slate-700">
                  <code className="block">
                    {formatCodeWithSyntaxHighlighting(code, language)}
                  </code>
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
  const formatContent = (text) => {
    const lines = text.split('\n');
    const formattedLines = [];

    lines.forEach((line, i) => {
      if (line.startsWith('## ')) {
        formattedLines.push(
          <h3 key={i} className="font-bold text-blue-400 text-base mt-4 mb-2">{line.replace('## ', '')}</h3>
        );
      } else if (/^[-*]\s/.test(line)) {
        formattedLines.push(
          <li key={i} className="list-disc list-inside text-slate-300 py-0.5">{line.replace(/^[-*]\s/, '')}</li>
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
  const formatBoldText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);

    return parts.map((part, index) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>
      ) : (
        part
      )
    );
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center shadow-md ${isUser ? 'bg-blue-600 ml-3' : 'bg-slate-700 mr-3'}`}>
          {isUser ? <User size={20} /> : <MessageCircle size={20} />}
        </div>
        
        {/* Message content */}
        <div className="flex flex-col">
          <div className={`px-5 py-4 rounded-2xl shadow-md ${
            isUser 
              ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-none' 
              : 'bg-gradient-to-br from-slate-700 to-slate-800 text-white rounded-tl-none border border-slate-600'
          }`}>
            {isUser ? (
              <p className="text-sm">{message.content}</p>
            ) : (
              formatResponse(message.content)
            )}
          </div>
          
          {/* Message footer with time and interactions */}
          <div className={`flex items-center mt-1 text-xs text-gray-400 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <span>{formattedTime}</span>
            
            {!isUser && (
              <div className="flex items-center ml-4">
                <button 
                  onClick={() => setLiked(!liked)}
                  className={`flex items-center space-x-1 ${liked ? 'text-blue-400' : 'hover:text-gray-300'}`}
                >
                  <ThumbsUp size={12} />
                  <span>{liked ? 'Liked' : 'Like'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
