// src/api.ts

export const fetchChatResponse = async (messages: { role: string; content: string }[]) => {
  try {
    const response = await fetch('http://localhost:4242/chat', {
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
