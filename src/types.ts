export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: number;
  voiceNote?: {
    url: string;
    duration: number; 
}
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// export interface Message {
// // in seconds
//   };
// }