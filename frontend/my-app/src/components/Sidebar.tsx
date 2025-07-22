'use client';
import { useEffect, useState } from 'react';
import API from '../lib/api';

export default function Sidebar({ onSelect, onNewChat, currentId, refreshTrigger }: any) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  const fetchChats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/chats');
      setChats(res.data || []);
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleRename = async (chatId: string) => {
    if (!newTitle.trim()) return;
    
    try {
      await API.put(`/chat/${chatId}/rename`, { newTitle: newTitle.trim() });
      setEditingChat(null);
      setNewTitle('');
      setShowOptions(null);
      fetchChats();
    } catch (error) {
      console.error('Error renaming chat:', error);
      alert('Failed to rename chat');
    }
  };

  const handleDelete = async (chatId: string) => {
    if (!confirm('Are you sure you want to delete this chat?')) return;
    
    try {
      await API.delete(`/chat/${chatId}`);
      setShowOptions(null);
      fetchChats();
      // If we deleted the current chat, select a new one
      if (chatId === currentId) {
        onNewChat();
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat');
    }
  };

  const startRename = (chat: any) => {
    setEditingChat(chat._id);
    setNewTitle(chat.title || 'New Chat');
    setShowOptions(null);
  };

  useEffect(() => {
    fetchChats();
  }, [refreshTrigger]);

  // Close options when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowOptions(null);
      setEditingChat(null);
    };
    
    if (showOptions || editingChat) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showOptions, editingChat]);

  return (
    <aside className="w-64 bg-gray-100 p-4 h-screen overflow-y-auto border-r">
      <button
        onClick={onNewChat}
        className="mb-4 w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        disabled={loading}
      >
        + New Chat
      </button>
      
      {loading ? (
        <div className="text-center text-gray-500 py-4">Loading chats...</div>
      ) : chats.length === 0 ? (
        <div className="text-center text-gray-500 py-4">No chats yet</div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat: any) => (
            <div
              key={chat._id}
              className={`relative rounded-lg transition-colors ${
                chat._id === currentId 
                  ? 'bg-blue-200 border-l-4 border-blue-500' 
                  : 'hover:bg-gray-200'
              }`}
            >
              {editingChat === chat._id ? (
                <div className="p-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRename(chat._id);
                      if (e.key === 'Escape') {
                        setEditingChat(null);
                        setNewTitle('');
                      }
                    }}
                    className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleRename(chat._id)}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setEditingChat(null);
                        setNewTitle('');
                      }}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => onSelect(chat._id)}
                  className="cursor-pointer p-3 flex justify-between items-start group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate mb-1">
                      {chat.title || 'New Chat'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(chat.createdAt)}
                    </div>
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptions(showOptions === chat._id ? null : chat._id);
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-gray-300 rounded transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>
                  
                  {showOptions === chat._id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-2 top-12 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
                    >
                      <button
                        onClick={() => startRename(chat)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Rename
                      </button>
                      <button
                        onClick={() => handleDelete(chat._id)}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
