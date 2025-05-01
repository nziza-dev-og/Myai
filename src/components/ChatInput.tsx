import { FormEvent, useState, useRef, useEffect } from 'react';
import { Send, Mic, Paperclip, X, Square } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export const ChatInput = ({ onSendMessage, isLoading }: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200); // Max height 200px
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [message]);

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

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
    if ((!message.trim() && !audioBlob) || isLoading) return;
    
    if (message.trim()) {
      const formatted = autoFormatMessage(message);
      onSendMessage(formatted);
      setMessage('');
    } else if (audioBlob) {
      handleSendAudio();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Submit on Enter (without shift for new line)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks in the stream to release the microphone
        stream.getTracks().forEach(track => track.stop());
        
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
    setAudioBlob(null);
    audioChunksRef.current = [];
    
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setRecordingTime(0);
  };
  
  const handleSendAudio = async () => {
    if (!audioBlob) return;
    
    try {
      // Import the transcribeAudio function from your API
      const { transcribeAudio } = await import('../api'); // Adjust path as needed
      
      // Show loading state
      onSendMessage("🎤 Processing voice message...");
      
      // Transcribe the audio
      const transcribedText = await transcribeAudio(audioBlob);
      
      // Send the transcribed text as a message
      if (transcribedText) {
        // Replace the loading message with the actual transcription
        onSendMessage(`🎤 ${transcribedText}`);
      } else {
        throw new Error('No transcription received');
      }
      
    } catch (error) {
      console.error('Error processing voice note:', error);
      // Don't alert - we already showed an error message in the chat
    } finally {
      // Clean up
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      {/* Recording UI overlay */}
      {isRecording && (
        <div className="absolute inset-0 bg-slate-800 rounded-xl flex items-center justify-between px-4 z-10">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-3"></div>
            <span className="text-white font-medium">Recording {formatTime(recordingTime)}</span>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={cancelRecording}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              aria-label="Cancel recording"
            >
              <X size={20} />
            </button>
            <button
              type="button"
              onClick={stopRecording}
              className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              aria-label="Stop recording"
            >
              <Square size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Audio preview UI */}
      {audioBlob && !isRecording && (
        <div className="absolute inset-0 bg-slate-800 rounded-xl flex items-center justify-between px-4 z-10">
          <div className="flex items-center">
            <div className="text-white font-medium flex items-center">
              <span className="text-blue-400 mr-2">🎤</span>
              <span>Voice note ready</span>
              <span className="text-slate-400 ml-2 text-sm">({formatTime(recordingTime)})</span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setAudioBlob(null)}
              className="p-2 text-slate-300 hover:text-white transition-colors"
              aria-label="Cancel voice note"
            >
              <X size={20} />
            </button>
            <button
              type="button"
              onClick={handleSendAudio}
              className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              aria-label="Send voice note"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
      
      {/* Attachment button (visual only) */}
      <button
        type="button"
        className="p-3 text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="Add attachment"
        disabled={isLoading || isRecording}
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
        disabled={isLoading || isRecording || !!audioBlob}
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
      
      {/* Voice input button */}
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        className={`p-3 transition-colors ${
          isRecording
            ? 'text-red-500 animate-pulse'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        aria-label={isRecording ? "Stop recording" : "Voice input"}
        disabled={isLoading || !!audioBlob}
      >
        <Mic size={18} />
      </button>
      
      {/* Send button */}
      <button
        type="submit"
        disabled={(!message.trim() && !audioBlob) || isLoading || isRecording}
        className={`p-3 flex items-center justify-center rounded-lg transition-all duration-200 ${
          (message.trim() || audioBlob) && !isLoading && !isRecording
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