import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import axios from 'axios';

let streamControllers = {}; 

export const createChat = async (req, res) => {
  try {
    const chat = await Chat.create({});
    res.status(201).json(chat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Failed to create chat: ' + error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;

    if (!chatId || !message) {
      return res.status(400).json({ error: 'Chat ID and message are required' });
    }


    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const controller = new AbortController();
    streamControllers[chatId] = controller;

   
    await Message.create({ chatId, role: 'user', content: message });

  
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    let assistantText = '';

    try {
      console.log('Sending request to Ollama:', process.env.OLLAMA_API);
      console.log('Message:', message);
      
    
      const ollamaRes = await axios.post(
        process.env.OLLAMA_API,
        {
          model: 'llama3.2:1b',
          prompt: message,
          stream: true,
        },
        { 
          responseType: 'stream', 
          signal: controller.signal,
          timeout: 120000, 
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      console.log('Ollama connection successful, status:', ollamaRes.status);

      ollamaRes.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (let line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              assistantText += parsed.response;
              res.write(`data: ${parsed.response}\n\n`);
            }
            if (parsed.done) {
              res.write(`data: [DONE]\n\n`);
            }
          } catch (e) {
            console.error('Error parsing Ollama response:', e);
          }
        }
      });

      ollamaRes.data.on('end', async () => {
        try {
          if (assistantText.trim()) {
            await Message.create({ chatId, role: 'assistant', content: assistantText });
          }
          delete streamControllers[chatId];
          res.end();
        } catch (error) {
          console.error('Error saving assistant message:', error);
          res.end();
        }
      });

      ollamaRes.data.on('error', (err) => {
        console.error('Ollama stream error:', err);
        delete streamControllers[chatId];
        res.write(`data: Error: ${err.message}\n\n`);
        res.end();
      });

    } catch (ollamaError) {
      console.error('Ollama streaming error:', ollamaError.message);
      
    
      try {
        console.log('Trying non-streaming fallback...');
        const fallbackRes = await axios.post(
          process.env.OLLAMA_API,
          {
            model: 'llama3.2:1b',
            prompt: message,
            stream: false,
          },
          { 
            timeout: 120000,
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );
        
        const response = fallbackRes.data.response;
        assistantText = response;
        
        
        const words = response.split(' ');
        let wordIndex = 0;
        
        const streamWords = () => {
          if (wordIndex < words.length) {
            const word = words[wordIndex] + ' ';
            res.write(`data: ${word}\n\n`);
            wordIndex++;
            setTimeout(streamWords, 30); // 30ms delay between words
          } else {
            res.write(`data: [DONE]\n\n`);
           
            Message.create({ chatId, role: 'assistant', content: assistantText })
              .then(() => {
                delete streamControllers[chatId];
                res.end();
              })
              .catch(err => {
                console.error('Error saving message:', err);
                delete streamControllers[chatId];
                res.end();
              });
          }
        };
        
        streamWords();
        
      } catch (fallbackError) {
        console.error('Ollama fallback error:', fallbackError.message);
        delete streamControllers[chatId];
        
        
        const errorMsg = ` Connection Error: ${fallbackError.message}\n\nTroubleshooting:\n1. Check if Ollama is running\n2. Verify model is installed: ollama list\n3. Try: ollama pull llama3.2:1b`;
        
        res.write(`data: ${errorMsg}\n\n`);
        res.write(`data: [DONE]\n\n`);
        
        
        try {
          await Message.create({ chatId, role: 'assistant', content: errorMsg });
        } catch (saveError) {
          console.error('Error saving message:', saveError);
        }
        
        res.end();
      }
    }

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Internal server error: ' + error.message });
  }
};

export const stopStreaming = (req, res) => {
  try {
    const { chatId } = req.params;
    if (streamControllers[chatId]) {
      streamControllers[chatId].abort();
      delete streamControllers[chatId];
    }
    res.status(200).json({ stopped: true });
  } catch (error) {
    console.error('Stop streaming error:', error);
    res.status(500).json({ error: 'Failed to stop streaming: ' + error.message });
  }
};

export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    console.error('Get all chats error:', error);
    res.status(500).json({ error: 'Failed to fetch chats: ' + error.message });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { chatId } = req.params;
    const messages = await Message.find({ chatId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history: ' + error.message });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Message.deleteMany({ chatId });
    await Chat.findByIdAndDelete(chatId);
    res.status(200).json({ deleted: true });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Failed to delete chat: ' + error.message });
  }
};

export const renameChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { newTitle } = req.body;
    const chat = await Chat.findByIdAndUpdate(chatId, { title: newTitle }, { new: true });
    res.json(chat);
  } catch (error) {
    console.error('Rename chat error:', error);
    res.status(500).json({ error: 'Failed to rename chat: ' + error.message });
  }
};
