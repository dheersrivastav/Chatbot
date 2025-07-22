'use client';
import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ChatInput from '../components/ChatInput';
import API from '../lib/api';

export default function HomePage() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [refreshSidebar, setRefreshSidebar] = useState(0);
  const readerRef = useRef<ReadableStreamDefaultReader | null>(null);

  const startNewChat = async () => {
    try {
      const res = await API.post('/chat');
      setChatId(res.data._id);
      setMessages([]);
     
      setRefreshSidebar(prev => prev + 1);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const loadMessages = async (id: string) => {
    try {
      setChatId(id);
      const res = await API.get(`/chat/${id}`);
      setMessages(res.data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const stopStreaming = async () => {
    if (chatId && streaming) {
      try {
        await API.post(`/chat/${chatId}/stop`);
        if (readerRef.current) {
          readerRef.current.cancel();
          readerRef.current = null;
        }
        setStreaming(false);
        setLoading(false);
      } catch (error) {
        console.error('Error stopping stream:', error);
      }
    }
  };

  const generateChatTitle = async (firstMessage: string, chatId: string) => {
    try {
      
      const words = firstMessage.trim().split(' ').slice(0, 4);
      let title = words.join(' ');
      if (firstMessage.length > 30) {
        title += '...';
      }
      
      
      await API.put(`/chat/${chatId}/rename`, { newTitle: title });
      setRefreshSidebar(prev => prev + 1);
    } catch (error) {
      console.error('Error generating chat title:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!chatId || streaming) return;
    
  
    const isFirstMessage = messages.length === 0;
    
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    setStreaming(true);

    try {
      const response = await fetch(`http://localhost:3001/api/chat/${chatId}/message`, {
        method: 'POST',
        body: JSON.stringify({ message: text }),
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', response.status, errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      readerRef.current = reader || null;
      const decoder = new TextDecoder();
      let assistantReply = '';

      // Add empty assistant message to start streaming
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const token = line.replace('data: ', '');
            if (token.trim() === '[DONE]') {
              
              break;
            }
            if (token.trim()) {
              assistantReply += token;
              setMessages((prev) => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                if (newMessages[lastIndex]?.role === 'assistant') {
                  newMessages[lastIndex] = {
                    ...newMessages[lastIndex],
                    content: assistantReply
                  };
                }
                return newMessages;
              });
            }
          }
        }
      }

      
      if (isFirstMessage) {
        await generateChatTitle(text, chatId);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, there was an error processing your message.' 
      }]);
    } finally {
      setLoading(false);
      setStreaming(false);
      readerRef.current = null;
    }
  };

  useEffect(() => {
    startNewChat();
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar 
        onSelect={loadMessages} 
        onNewChat={startNewChat} 
        currentId={chatId}
        refreshTrigger={refreshSidebar}
      />
      <div className="flex flex-col flex-1">
        <ChatWindow messages={messages} />
        <ChatInput 
          onSend={sendMessage} 
          loading={loading}
          streaming={streaming}
          onStop={stopStreaming}
        />
      </div>
    </div>
  );
}
