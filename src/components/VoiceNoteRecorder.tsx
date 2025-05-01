import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Trash2, Volume2, Loader2 } from 'lucide-react';

// Voice Note Recorder component that can be added to your chat interface
export const VoiceNoteRecorder = ({ onSendVoiceNote }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(new Audio());
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      cleanupRecording();
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
  
  // Format recording time display (mm:ss)
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Start recording audio
  const startRecording = async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Reset recording state
      audioChunksRef.current = [];
      setRecordingTime(0);
      
      // Create new MediaRecorder instance
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up event handlers
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        // Create blob from recorded audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Create URL for preview playback
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Set up audio for preview
        audioRef.current.src = url;
        
        // Switch to preview mode
        setIsPreviewing(true);
        
        // Stop all tracks from the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Set up timer to track recording duration
      timerRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };
  
  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear recording timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Cancel recording or preview
  const cancelRecording = () => {
    cleanupRecording();
    setIsPreviewing(false);
    setIsRecording(false);
    setRecordingTime(0);
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
    }
    
    setAudioBlob(null);
  };
  
  // Clean up recording resources
  const cleanupRecording = () => {
    // Stop MediaRecorder if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    // Clear recording timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Stop audio preview if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };
  
  // Toggle playback of recorded audio
  const togglePlayback = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  };
  
  // Convert Blob to Base64 string
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };
  
  // Send the voice note
  const sendVoiceNote = async () => {
    if (!audioBlob) return;
    
    try {
      setIsSending(true);
      
      // Convert audio blob to base64 string
      const audioBase64 = await blobToBase64(audioBlob);
      
      // Create voice note data structure
      const voiceNoteData = {
        audio: audioBase64,
        duration: recordingTime,
        format: 'webm',
        timestamp: Date.now()
      };
      
      // Call provided callback to handle sending
      await onSendVoiceNote(voiceNoteData);
      
      // Reset state after sending
      cancelRecording();
    } catch (error) {
      console.error('Error sending voice note:', error);
      alert('Failed to send voice note. Please try again.');
    } finally {
      setIsSending(false);
    }
  };
  
  // Process API response and send message
  const processAndSendVoiceMessage = async (voiceNoteData) => {
    try {
      // Prepare API request based on your provided code
      const requestData = {
        bulkId: `VOICE-${Date.now()}`,
        messages: [
          {
            from: "YourAppName", // Replace with your sender ID
            destinations: [
              {
                to: "RECIPIENT_ID", // Replace with recipient ID or use dynamic value
                messageId: `MSG-${Date.now()}`
              }
            ],
            text: "Voice message", // Or transcription if available
            language: "en",
            voice: {
              name: "Joanna", 
              gender: "female"
            },
            speechRate: 1,
            // Add other required parameters from your API
          }
        ]
      };
      
      // Here you would call your API - using the code you provided
      // For this example, we'll simulate the API call
      
      // Return the voice note with URL that would come from your API
      return {
        url: audioUrl, // In real implementation, this would be the URL from your API
        duration: voiceNoteData.duration,
        id: `voice-${Date.now()}`
      };
    } catch (error) {
      console.error('Error processing voice message:', error);
      throw new Error('Failed to process voice message');
    }
  };
  
  return (
    <div className="mt-2 w-full">
      {/* Recording/Preview Container */}
      <div className="bg-slate-800 rounded-lg p-3 flex items-center space-x-3">
        {isRecording ? (
          /* Recording UI */
          <>
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center animate-pulse">
              <Mic size={20} className="text-white" />
            </div>
            
            <div className="flex-1 flex items-center justify-between">
              <div className="text-slate-200 flex items-center">
                <span className="mr-2">Recording</span>
                <span className="text-red-400">{formatTime(recordingTime)}</span>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={cancelRecording}
                  className="p-2 hover:bg-slate-700 rounded-full text-slate-400"
                  title="Cancel recording"
                >
                  <Trash2 size={18} />
                </button>
                
                <button 
                  onClick={stopRecording}
                  className="p-2 bg-slate-700 hover:bg-slate-600 rounded-full text-white"
                  title="Stop recording"
                >
                  <Square size={18} />
                </button>
              </div>
            </div>
          </>
        ) : isPreviewing ? (
          /* Preview UI */
          <>
            <button 
              onClick={togglePlayback}
              className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white"
              title="Play/pause preview"
            >
              <Volume2 size={20} />
            </button>
            
            <div className="flex-1 flex items-center justify-between">
              <div className="text-slate-200">
                <span className="text-slate-400">{formatTime(recordingTime)}</span>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={cancelRecording}
                  className="p-2 hover:bg-slate-700 rounded-full text-slate-400"
                  title="Discard voice note"
                >
                  <Trash2 size={18} />
                </button>
                
                <button 
                  onClick={sendVoiceNote}
                  disabled={isSending}
                  className={`p-2 ${isSending ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'} rounded-full text-white`}
                  title="Send voice note"
                >
                  {isSending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Start Recording Button */
          <button 
            onClick={startRecording}
            className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-full transition-colors w-full"
          >
            <Mic size={18} />
            <span>Record Voice Note</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default VoiceNoteRecorder;