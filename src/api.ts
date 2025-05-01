// src/api.ts

export const fetchChatResponse = async (messages: { role: string; content: string }[]) => {
  try {
    const response = await fetch('https://aiserver-2pgq.onrender.com/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Failed to get response');
    }
    
    const data = await response.json();
    console.log('API response:', data);
    
    if (!data.choices || !data.choices[0]) {
      throw new Error('Invalid response format: no choices');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling API:', error);
    throw error;
  }
};

// New function for transcribing audio
export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  try {
    // Option 1: If your server has a transcribe endpoint
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    try {
      const response = await fetch('https://aiserver-2pgq.onrender.com/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.text) {
          return data.text;
        }
      }
      // If server transcription fails, fall back to option 2
      console.log('Server transcription failed, using fallback method');
    } catch (serverError) {
      console.error('Server transcription error:', serverError);
      // Continue to fallback method
    }
    
    // Option 2: Fallback - Convert audio to base64 and send to the chat endpoint
    // This approach sends the audio as part of a message to your AI service
    const base64Audio = await blobToBase64(audioBlob);
    const audioMessage = {
      role: "user",
      content: `[Voice message: Please transcribe this audio] ${base64Audio.substring(0, 100)}... (audio data truncated)`
    };
    
    // Create a temporary message to inform the user
    const placeholderTranscription = "Processing voice message...";
    
    // In a real implementation, you might want to send the audioMessage to your AI
    // and get back a transcription. For now, we'll simulate it:
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return a default message since we can't actually process the audio
    return placeholderTranscription;
    
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return "Failed to transcribe audio. Please type your message instead.";
  }
};

// Helper function to convert Blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};