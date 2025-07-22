import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  title: { type: String, default: 'New Chat' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Chat', ChatSchema);
