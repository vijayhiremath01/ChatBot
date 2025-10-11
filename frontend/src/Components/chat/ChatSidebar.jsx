
import React, { useState, useEffect } from "react";
import { Chat } from "@/entities/Chat.js";
import { Message } from "@/entities/Message.js";

import {
  Search,
  Plus,
  MessageSquare,
  Calendar,
  Trash2,
  MoreHorizontal,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";

export default function ChatSidebar({
  selectedChatId,
  onChatSelect,
  onNewChat,
  isOpen,
  onClose,
  refreshKey
}) {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  useEffect(() => {
    loadChats();
  }, [refreshKey]);

  const loadChats = async () => {
    setIsLoading(true);
    try {
      const fetchedChats = await Chat.list("-updated_date");
      setChats(fetchedChats);
    } catch (error) {
      console.error("Failed to load chats:", error);
    }
    setIsLoading(false);
  };

  const handleDeleteChat = async (chat) => {
    try {
      // Delete all messages in the chat first
      const messages = await Message.filter({ chat_id: chat.id });
      for (const message of messages) {
        await Message.delete(message.id);
      }

      // Delete the chat
      await Chat.delete(chat.id);

      // Update local state
      setChats(prevChats => prevChats.filter(c => c.id !== chat.id));

      // If the deleted chat was selected, clear selection
      if (selectedChatId === chat.id) {
        onChatSelect(null);
      }

      setDeleteDialogOpen(false);
      setChatToDelete(null);
    } catch (error) {
      console.error("Failed to delete chat:", error);
    }
  };

  const openDeleteDialog = (chat, e) => {
    e.stopPropagation();
    setChatToDelete(chat);
    setDeleteDialogOpen(true);
  };

  const filteredChats = chats.filter(chat =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chat.last_message && chat.last_message.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const groupChatsByDate = (chats) => {
    const groups = {
      today: [],
      yesterday: [],
      week: [],
      older: []
    };

    chats.forEach(chat => {
      const chatDate = new Date(chat.updated_date);
      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (Date.now() - chatDate.getTime() < 7 * 24 * 60 * 60 * 1000) {
        groups.week.push(chat);
      } else {
        groups.older.push(chat);
      }
    });

    return groups;
  };

  const groupedChats = groupChatsByDate(filteredChats);

  const formatChatDate = (date) => {
    const chatDate = new Date(date);
    if (isToday(chatDate)) return "Today";
    if (isYesterday(chatDate)) return "Yesterday";
    return format(chatDate, "MMM d, yyyy");
  };

  const ChatItem = ({ chat }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.98 }}
      className={`sidebar-chat-item ${
        selectedChatId === chat.id ? 'sidebar-chat-item--selected' : ''
      }`}
      onClick={() => onChatSelect(chat)}
    >
      <div className="sidebar-chat-avatar">
        <MessageSquare className="w-4 h-4" />
      </div>
      <div className="sidebar-chat-content">
        <h3 className="sidebar-chat-title">{chat.title}</h3>
        {chat.last_message && (
          <p className="sidebar-chat-preview">{chat.last_message}</p>
        )}
        <div className="sidebar-chat-meta">
          <Calendar className="w-3 h-3" />
          <span className="sidebar-chat-date">
            {formatChatDate(chat.updated_date)}
          </span>
        </div>
      </div>
      <div className="sidebar-chat-actions">
        <button
          className="sidebar-chat-delete"
          onClick={(e) => openDeleteDialog(chat, e)}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  const ChatGroup = ({ title, chats }) => {
    if (chats.length === 0) return null;

    return (
      <div className="sidebar-group">
        <h3 className="sidebar-group-title">{title}</h3>
        <div className="sidebar-group-items">
          {chats.map((chat) => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.div
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 320, opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="sidebar-container"
      >
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-header-content">
            <h1 className="sidebar-title">znozx</h1>
            <div className="sidebar-actions">
              <button
                onClick={onNewChat}
                className="sidebar-button sidebar-button--primary"
              >
                <Plus className="w-4 h-4" />
              </button>
              {isOpen && (
                <button
                  onClick={onClose}
                  className="sidebar-button sidebar-button--secondary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="sidebar-search">
            <Search className="sidebar-search-icon" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="sidebar-search-input"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="sidebar-messages">
          <AnimatePresence>
            {isLoading ? (
              <div className="sidebar-loading">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="sidebar-loading-item">
                    <div className="sidebar-loading-avatar" />
                    <div className="sidebar-loading-content">
                      <div className="sidebar-loading-line" />
                      <div className="sidebar-loading-line sidebar-loading-line--short" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredChats.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sidebar-empty"
              >
                <MessageSquare className="sidebar-empty-icon" />
                <p className="sidebar-empty-title">
                  {searchQuery ? "No chats found" : "No conversations yet"}
                </p>
                <p className="sidebar-empty-subtitle">
                  {searchQuery ? "Try a different search term" : "Start a new chat to begin"}
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="sidebar-groups"
              >
                <ChatGroup title="Today" chats={groupedChats.today} />
                <ChatGroup title="Yesterday" chats={groupedChats.yesterday} />
                <ChatGroup title="This Week" chats={groupedChats.week} />
                <ChatGroup title="Older" chats={groupedChats.older} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="sidebar-dialog-overlay" onClick={() => setDeleteDialogOpen(false)}>
          <div className="sidebar-dialog-content" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-dialog-header">
              <h2 className="sidebar-dialog-title">Delete Chat</h2>
              <p className="sidebar-dialog-description">
                Are you sure you want to delete "{chatToDelete?.title}"? This action cannot be undone and will delete all messages in this conversation.
              </p>
            </div>
            <div className="sidebar-dialog-footer">
              <button
                onClick={() => setDeleteDialogOpen(false)}
                className="sidebar-dialog-button sidebar-dialog-button--cancel"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteChat(chatToDelete)}
                className="sidebar-dialog-button sidebar-dialog-button--destructive"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

