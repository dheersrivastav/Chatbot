import express from 'express';
import {
  createChat,
  sendMessage,
  stopStreaming,
  getAllChats,
  getChatHistory,
  deleteChat,
  renameChat,
} from '../controllers/chatController.js';

const router = express.Router();

router.post('/chat', createChat);
router.post('/chat/:chatId/message', sendMessage);
router.post('/chat/:chatId/stop', stopStreaming);
router.get('/chats', getAllChats);
router.get('/chat/:chatId', getChatHistory);
router.delete('/chat/:chatId', deleteChat);
router.put('/chat/:chatId/rename', renameChat);

export default router;
