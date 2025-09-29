
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Chat as ChatEntity } from "@/entities/Chat";
import { Message } from "@/entities/Message";
import { User } from "@/entities/User";
import { InvokeLLM } from "@/integrations/Core";
import { Button } from "@/components/ui/button";
import { Menu, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ChatSidebar from "../Components/chat/ChatSidebar";
import MessageBubble from "../Components/chat/MessageBubble";
import MessageInput from "../Components/chat/MessageInput";
import SearchButton from "../Components/chat/SearchButton";

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [user, setUser] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    initializeUser();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    } else {
      setMessages([]); // Clear messages if no chat is selected (e.g., after deletion)
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const initializeUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("User not authenticated:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async (chatId) => {
    try {
      const fetchedMessages = await Message.filter({ chat_id: chatId }, "created_date");
      setMessages(fetchedMessages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  };

  const handleNewChat = async () => {
    try {
      const newChat = await ChatEntity.create({
        title: "New Chat",
        last_message: "",
        message_count: 0
      });
      setSelectedChat(newChat);
      setMessages([]);
      refresh(); // Refresh the sidebar
    } catch (error) {
      console.error("Failed to create new chat:", error);
    }
  };

  const handleChatSelect = (chat) => {
    if (chat === null) {
      // This happens when a selected chat is deleted
      refresh();
    }
    setSelectedChat(chat);
  };

  const handleSearchQuery = async (query) => {
    // Create new chat and send the search query
    await handleNewChat();
    // Small delay to ensure chat is created
    setTimeout(() => {
      handleSendMessage(query);
    }, 100);
  };

  const updateChatTitle = async (chatId, firstMessage) => {
    try {
      // Generate a title based on the first message
      const titleResponse = await InvokeLLM({
        prompt: `Generate a concise, descriptive title (max 6 words) for a chat that starts with this message: "${firstMessage}". Return only the title, nothing else.`,
      });
      
      const title = titleResponse.trim().replace(/"/g, '');
      
      await ChatEntity.update(chatId, {
        title: title,
        last_message: firstMessage.substring(0, 100),
        message_count: 1
      });
      
      setSelectedChat(prev => prev ? { ...prev, title } : null);
    } catch (error) {
      console.error("Failed to update chat title:", error);
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedChat || isLoading) return;

    setIsLoading(true);
    
    try {
      // Create user message
      const userMessage = await Message.create({
        chat_id: selectedChat.id,
        content,
        role: "user",
        timestamp: new Date().toISOString()
      });

      setMessages(prev => [...prev, userMessage]);

      // Update chat title if this is the first message
      if (messages.length === 0) {
        updateChatTitle(selectedChat.id, content);
      }

      // Show typing indicator
      setIsTyping(true);

      // Generate AI response
      const aiResponse = await InvokeLLM({
        prompt: content,
      });

      setIsTyping(false);

      // Create assistant message
      const assistantMessage = await Message.create({
        chat_id: selectedChat.id,
        content: aiResponse,
        role: "assistant",
        timestamp: new Date().toISOString()
      });

      setMessages(prev => [...prev, assistantMessage]);

      // Update chat with last message
      await ChatEntity.update(selectedChat.id, {
        last_message: content.substring(0, 100),
        message_count: messages.length + 2
      });

    } catch (error) {
      console.error("Failed to send message:", error);
      setIsTyping(false);
    }

    setIsLoading(false);
  };

  const EmptyState = () => (
    <motion.div
      
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      
      className="flex-1 flex items-center justify-center p-8"
    >
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[var(--accent-light)] to-[var(--text-secondary)] flex items-center justify-center shadow-lg"
        >
          <Sparkles className="w-10 h-10 text-[var(--bg-primary)]" />
        </motion.div>
        
        <motion.h1
          
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          
          className="text-3xl font-bold text-[var(--text-primary)] mb-4"
        >
          Welcome to AI Chat
        </motion.h1>
        
        <motion.p
          
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          
          className="text-lg text-[var(--text-secondary)] mb-8"
        >
          Start a conversation with our AI assistant. Ask questions, get help with tasks, or just have a friendly chat.
        </motion.p>

        {/* Search Button */}
        <motion.div
          
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          
          className="mb-12"
        >
          <SearchButton onSearch={handleSearchQuery} onNewChat={handleNewChat} />
        </motion.div>

        <motion.div
          
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          
          className="grid md:grid-cols-3 gap-4 text-left"
        >
          {[
            {
              icon: "💡",
              title: "Get Ideas",
              description: "Brainstorm creative solutions and innovative approaches"
            },
            {
              icon: "📝",
              title: "Write Content",
              description: "Generate articles, emails, and professional documents"
            },
            {
              icon: "🔍",
              title: "Research Topics",
              description: "Explore subjects and get detailed explanations"
            }
          ].map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer"
            >
              <div className="text-2xl mb-2">{item.icon}</div>
              <h3 className="font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );

  return (
    <div className="flex h-screen bg-[var(--bg-primary)]">
      {/* Sidebar */}
      <AnimatePresence>
        <ChatSidebar
          selectedChatId={selectedChat?.id}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          refreshKey={refreshKey} // Pass refreshKey to sidebar
        />
      </AnimatePresence>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSidebarOpen(true)}
                className="w-8 h-8 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              >
                <Menu className="w-4 h-4" />
              </Button>
            )}
            
            {selectedChat && (
              <div>
                <h2 className="font-semibold text-[var(--text-primary)]">{selectedChat.title}</h2>
                <p className="text-xs text-[var(--text-muted)]">
                  {messages.length} messages
                </p>
              </div>
            )}
          </div>

          {selectedChat && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewChat}
              className="border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
            >
              New Chat
            </Button>
          )}
        </div>

        {/* Messages Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto scrollbar-thin"
        >
          {!selectedChat ? (
            <EmptyState />
          ) : (
            <div className="max-w-4xl mx-auto p-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                {isTyping && <MessageBubble isTyping={true} />}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        {selectedChat && (
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            placeholder="Type your message..."
          />
        )}
      </div>
    </div>
  );
}
