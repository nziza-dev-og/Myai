import { MessageCircle, User, ClipboardCopy, Check, ThumbsUp, Share, Play, Pause, Mic, Volume2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

// Extended Message type to include voice note
// You would need to update your Message type in ../types.ts
/*
interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  voiceNote?: {
    url: string;
    duration: number; // in seconds
  };
}
*/

export const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === 'user';
  const [copiedCodeBlock, setCopiedCodeBlock] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(message.voiceNote?.duration || 0);
  const [audioLoaded, setAudioLoaded] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Initialize audio element for voice notes
  useEffect(() => {
    if (message.voiceNote) {
      // Create audio element if it doesn't exist
      if (!audioRef.current) {
        const audio = new Audio();
        audio.src = message.voiceNote.url;
        audio.preload = 'metadata';
        audioRef.current = audio;
        
        // Set up event listeners
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration);
          setAudioLoaded(true);
        });
        
        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime);
        });
        
        audio.addEventListener('ended', () => {
          setIsPlaying(false);
          setCurrentTime(0);
          audio.currentTime = 0;
        });
        
        audio.addEventListener('play', () => {
          setIsPlaying(true);
        });
        
        audio.addEventListener('pause', () => {
          setIsPlaying(false);
        });
        
        // Handle errors
        audio.addEventListener('error', (e) => {
          console.error('Audio error:', e);
          setAudioLoaded(false);
        });
      }
    }
    
    // Cleanup function
    return () => {
      if (audioRef.current) {
        const audio = audioRef.current;
        audio.pause();
        audio.removeEventListener('loadedmetadata', () => {});
        audio.removeEventListener('timeupdate', () => {});
        audio.removeEventListener('ended', () => {});
        audio.removeEventListener('play', () => {});
        audio.removeEventListener('pause', () => {});
        audio.removeEventListener('error', () => {});
      }
    };
  }, [message.voiceNote]);
  
  // Format timestamp display
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(new Date(message.timestamp));
  
  // Format audio duration and current time (mm:ss)
  const formatAudioTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Handle voice note playback
  const togglePlay = () => {
    if (!audioRef.current || !audioLoaded) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Create AudioContext on first play (to avoid autoplay restrictions)
        if (!audioContextRef.current) {
          audioContextRef.current = new AudioContext();
        }
        
        // Ensure audio context is running (may be suspended due to browser policies)
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }
        
        const playPromise = audioRef.current.play();
        
        // Handle play promise to catch potential errors
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              // Playback started successfully
            })
            .catch(err => {
              console.error('Playback failed:', err);
              setIsPlaying(false);
            });
        }
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
      setIsPlaying(false);
    }
  };
  
  // Handle progress bar click for seeking
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !audioLoaded) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentX = clickX / rect.width;
    
    // Set new playback position
    audioRef.current.currentTime = percentX * duration;
    setCurrentTime(percentX * duration);
  };

  // Handle copying of code blocks
  const handleCopy = async (code: string, index: number) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeBlock(index);
      setTimeout(() => setCopiedCodeBlock(null), 1500);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  // Format code with syntax highlighting
  const formatCodeWithSyntaxHighlighting = (code: string, language: string) => {
    // Basic syntax highlighting function
    const tokenize = (code: string, language: string) => {
      // Define patterns for different code elements based on language
      const patterns = {
        // Keywords
        keywords: {
          jsx: /\b(import|export|from|function|const|let|var|return|if|for|while|class|extends|new|this|useState|useEffect|null|undefined|true|false)\b/g,
          js: /\b(import|export|from|function|const|let|var|return|if|for|while|class|extends|new|this|null|undefined|true|false)\b/g,
          ts: /\b(import|export|from|function|const|let|var|return|if|for|while|class|extends|new|this|null|undefined|true|false|interface|type|namespace)\b/g,
          tsx: /\b(import|export|from|function|const|let|var|return|if|for|while|class|extends|new|this|null|undefined|true|false|interface|type|namespace)\b/g,
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
        // TypeScript types
        typescript_types: /\b(string|number|boolean|any|void|object|never|unknown)\b/g,
      };
      
      // Choose language patterns
      const langKey = (language === 'jsx' || language === 'js' || language === 'ts' || language === 'tsx') 
        ? language 
        : 'default';
      const langPatterns = patterns.keywords[langKey as keyof typeof patterns.keywords] || patterns.keywords.default;
      
      // Replace code with highlighted spans
      let highlightedCode = code;
      
      // Handle comments first to avoid conflicts
      highlightedCode = highlightedCode.replace(patterns.comments, match => 
        `<span style="color: #6b7280;">${match}</span>`
      );
      
      // Handle strings
      highlightedCode = highlightedCode.replace(patterns.strings, match => 
        `<span style="color: #fbbf24;">${match}</span>`
      );
      
      // Handle JSX tags for JSX/TSX languages
      if (language === 'jsx' || language === 'tsx') {
        highlightedCode = highlightedCode.replace(patterns.jsx_tags, match => 
          `<span style="color: #60a5fa;">${match}</span>`
        );
        
        // React hooks
        highlightedCode = highlightedCode.replace(patterns.react_hooks, match => 
          `<span style="color: #c084fc;">${match}</span>`
        );
      }
      
      // Handle keywords
      highlightedCode = highlightedCode.replace(langPatterns, match => 
        `<span style="color: #ec4899;">${match}</span>`
      );
      
      // Handle numbers
      highlightedCode = highlightedCode.replace(patterns.numbers, match => 
        `<span style="color: #34d399;">${match}</span>`
      );
      
      // Handle TypeScript types
      if (language === 'ts' || language === 'tsx') {
        highlightedCode = highlightedCode.replace(patterns.typescript_types, match => 
          `<span style="color: #2dd4bf;">${match}</span>`
        );
      }
      
      // Handle function calls - must be after keywords
      highlightedCode = highlightedCode.replace(patterns.functions, match => {
        // Extract just the function name without the opening parenthesis
        const funcName = match.substring(0, match.length - 1);
        return `<span style="color: #60a5fa;">${funcName}</span>(`;
      });
      
      return { __html: highlightedCode };
    };

    return <div dangerouslySetInnerHTML={tokenize(code, language)} />;
  };

  // Format the message content
  const formatBotResponse = (content: string) => {
    const sections = content.split(/(?=```)/g); // Split when code block starts

    return (
      <div className="space-y-4">
        {sections.map((section, index) => {
          if (section.startsWith('```')) {
            // Extract language if specified
            const languageMatch = section.match(/```([a-z]*)\n?/);
            const language = languageMatch ? languageMatch[1] : '';
            
            // Remove the code block markers and language identifier
            const code = section.replace(/```[a-z]*\n?/, '').replace(/```$/, '');

            return (
              <div key={index} className="relative group">
                {/* Language label */}
                {language && (
                  <div className="absolute top-0 left-3 px-2 py-0.5 bg-slate-700/70 text-xs text-slate-300 rounded-b-md backdrop-blur-sm">
                    {language}
                  </div>
                )}
                
                {/* Copy button */}
                <button
                  onClick={() => handleCopy(code, index)}
                  className="absolute top-2 right-2 bg-slate-700/70 backdrop-blur-sm hover:bg-slate-600 text-white p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                  title={copiedCodeBlock === index ? 'Copied!' : 'Copy code'}
                >
                  {copiedCodeBlock === index ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <ClipboardCopy size={16} />
                  )}
                </button>

                {/* Code Block */}
                <pre className="bg-slate-900 text-slate-200 rounded-xl p-5 pt-8 overflow-x-auto text-sm mt-2 border border-slate-700 shadow-inner">
                  <code className="block">
                    {formatCodeWithSyntaxHighlighting(code, language)}
                  </code>
                </pre>
              </div>
            );
          } else {
            // Regular text content
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

  const formatContent = (text) => {
    // Basic formatting for regular text content
    // Handle simple markdown-like formatting
    return text
      .split('\n')
      .map((line, idx) => {
        // Process headings
        if (line.match(/^#{1,6}\s/)) {
          const level = line.match(/^(#{1,6})\s/)[1].length;
          const content = line.replace(/^#{1,6}\s/, '');
          const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base font-bold', 'text-sm font-bold', 'text-xs font-bold'];
          return (
            <div key={idx} className={`${sizes[level-1]} font-semibold my-2`}>
              {content}
            </div>
          );
        }
        
        // Process bold text
        let processedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Process italic text
        processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Process inline code
        processedLine = processedLine.replace(/`(.*?)`/g, '<code class="bg-slate-800 text-slate-200 px-1 py-0.5 rounded text-xs">$1</code>');
        
        // Return processed line with dangerouslySetInnerHTML
        return line ? (
          <p key={idx} className="my-1" dangerouslySetInnerHTML={{ __html: processedLine }} />
        ) : (
          <div key={idx} className="h-2" /> // Empty line spacer
        );
      });
  };

  // Render voice note player
  const renderVoiceNote = () => {
    if (!message.voiceNote) return null;
    
    // Calculate progress percentage
    const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    // Generate waveform bars with varying heights based on position
    const generateWaveformBars = () => {
      const bars = [];
      const barCount = 40;
      
      for (let i = 0; i < barCount; i++) {
        // Create a deterministic but varied height pattern
        const position = i / barCount;
        const seed = message.id ? message.id.charCodeAt(i % message.id.length) : i;
        const noise = Math.sin(position * 8 + seed * 0.1) * 0.5;
        const height = 20 + noise * 15;
        
        // Apply active/inactive styling based on playback position
        const isActive = (position * 100) <= progressPercent;
        
        bars.push(
          <div
            key={i}
            className={`w-0.5 rounded-full ${isActive ? 'bg-blue-400' : 'bg-slate-600'}`}
            style={{ height: `${height}px` }}
          />
        );
      }
      
      return bars;
    };
    
    return (
      <div className="mt-3 bg-slate-800 rounded-lg p-3">
        <div className="flex items-center space-x-3">
          {/* Play/Pause button */}
          <button 
            onClick={togglePlay}
            disabled={!audioLoaded}
            className={`w-10 h-10 flex items-center justify-center ${
              audioLoaded 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-slate-700 cursor-not-allowed'
            } rounded-full text-white transition-colors`}
            title={audioLoaded ? (isPlaying ? 'Pause' : 'Play') : 'Loading audio...'}
          >
            {isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="ml-1" />
            )}
          </button>
          
          {/* Voice visualization + progress bar */}
          <div className="flex-1 space-y-1">
            {/* Clickable progress bar */}
            <div 
              className="h-8 relative bg-slate-900 rounded-md overflow-hidden cursor-pointer"
              onClick={handleProgressBarClick}
            >
              {/* Waveform visualization */}
              <div className="absolute inset-0 flex items-center justify-around px-1 z-10">
                {generateWaveformBars()}
              </div>
              
              {/* Progress overlay */}
              <div 
                className="absolute top-0 left-0 h-full bg-blue-500/20 transition-all duration-100 z-0"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            
            {/* Time indicators */}
            <div className="flex justify-between text-xs text-slate-400">
              <span>{formatAudioTime(currentTime)}</span>
              <span>{formatAudioTime(duration)}</span>
            </div>
          </div>
          
          {/* Voice note indicator */}
          <div className="text-slate-400">
            <Volume2 size={18} />
          </div>
        </div>
        
        {/* Audio loading state */}
        {message.voiceNote && !audioLoaded && (
          <div className="text-xs text-slate-400 mt-2 text-center">
            Loading audio...
          </div>
        )}
      </div>
    );
  };

  // Main component return
  return (
    <div 
      className={`p-4 ${isUser ? 'bg-slate-800' : 'bg-slate-900'} rounded-lg mb-4 relative`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <div className="flex items-start space-x-4">
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-600' : 'bg-purple-600'
        }`}>
          {isUser ? (
            <User size={18} className="text-white" />
          ) : (
            <MessageCircle size={18} className="text-white" />
          )}
        </div>
        
        {/* Message Content */}
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-slate-200">
              {isUser ? 'You' : 'Assistant'}
            </h3>
            <span className="text-xs text-slate-400">{formattedTime}</span>
          </div>
          
          <div className="text-slate-300">
            {/* Text content */}
            {message.content && (
              isUser ? (
                <div className="whitespace-pre-wrap">{message.content}</div>
              ) : (
                formatBotResponse(message.content)
              )
            )}
            
            {/* Voice note player (if present) */}
            {message.voiceNote && renderVoiceNote()}
          </div>
        </div>
      </div>
      
      {/* Message controls - only shown for bot messages */}
      {!isUser && showControls && (
        <div className="absolute bottom-2 right-2 flex space-x-2 bg-slate-800/80 backdrop-blur-sm p-1 rounded-lg">
          <button 
            className={`p-1.5 rounded-md ${liked ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
            onClick={() => setLiked(!liked)}
            title="Like this response"
          >
            <ThumbsUp size={16} />
          </button>
          <button 
            className="p-1.5 text-slate-400 hover:bg-slate-700 rounded-md"
            onClick={() => {/* Share functionality would go here */}}
            title="Share this response"
          >
            <Share size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;