import React, { useState, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { ChatSidebar, SearchButton, MessageBubble, MessageInput } from './Components/chat';
import { Message } from './entities/Message.js';
import { Chat } from './entities/Chat.js';

function App() {
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messages, setMessages] = useState(() => {
    // Load messages from localStorage on initial render
    const savedMessages = localStorage.getItem('chatMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // Auto-scroll to the latest message whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Save messages to localStorage whenever they change
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const handleNewChat = async () => {
    try {
      const newChat = await Chat.create({ title: 'New Chat' });
      setSelectedChatId(newChat.id);
      setMessages([]);
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const handleChatSelect = async (chat) => {
    if (chat) {
      setSelectedChatId(chat.id);
      try {
        const chatMessages = await Message.list(chat.id);
        setMessages(chatMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    } else {
      setSelectedChatId(null);
      setMessages([]);
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedChatId) return;

    try {
      setIsLoading(true);
      
      // Create user message
      const userMessage = await Message.create({
        chat_id: selectedChatId,
        content,
        role: 'user'
      });
      
      setMessages(prev => [...prev, userMessage]);

      // Connect to the backend with message history
      const messageHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Backend URL - use Vite proxy to forward to backend
      const backendUrl = '/api/ask';
      
      fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: content,
          history: messageHistory 
        })
      })
      .then(response => response.json())
      .then(async (data) => {
        // Create AI message with response from backend
        const aiMessage = await Message.create({
          chat_id: selectedChatId,
          content: data.answer,
          role: 'assistant'
        });
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Update chat with last message
        await Chat.update(selectedChatId, { 
          last_message: content,
          message_count: messages.length + 2
        });
      })
      .catch(async (error) => {
        console.error('Error connecting to backend:', error);
        // Create error message if backend connection fails
        const errorMessage = await Message.create({
          chat_id: selectedChatId,
          content: "Sorry, I couldn't connect to the knowledge base. Please try again later.",
          role: 'assistant'
        });
        
        setMessages(prev => [...prev, errorMessage]);
      })
      .finally(() => {
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      {sidebarOpen && (
        <ChatSidebar
          selectedChatId={selectedChatId}
          onChatSelect={handleChatSelect}
          onNewChat={handleNewChat}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Chat Area */}
      <div className="app-main-area">
        {/* Header */}
        <div className="app-header">
          <SearchButton onClick={() => setSidebarOpen(!sidebarOpen)} />
          <div className="app-header-content">
            <div className="app-header-avatar">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <h1 className="app-header-title">znozx</h1>
              <p className="app-header-subtitle">
                {selectedChatId ? 'AI Assistant' : 'Select a chat to start'}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="app-messages">
          {messages.length === 0 ? (
            <div className="app-empty-state">
              <div className="app-empty-content">
                <div className="app-empty-avatar">AI</div>
                <h2 className="app-empty-title">How can I help you today?</h2>
                <p className="app-empty-subtitle">
                  Start a new conversation or select an existing chat from the sidebar.
                </p>
              </div>
            </div>
          ) : (
            <div className="app-messages-container">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isUser={message.role === 'user'}
                />
              ))}
              {isLoading && (
                <div className="app-loading">
                  <div className="app-loading-container">
                    <div className="app-loading-avatar">AI</div>
                    <div className="app-loading-bubble">
                      <div className="app-loading-dots">
                        <div className="app-loading-dot"></div>
                        <div className="app-loading-dot"></div>
                        <div className="app-loading-dot"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Anchor ensures smooth scroll to bottom */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        {selectedChatId && (
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={isLoading}
          />
        )}
      </div>
    </div>
  );
}

export default App ;