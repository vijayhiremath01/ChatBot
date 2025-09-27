import React from 'react';
import { Send, Paperclip, Smile, Plus } from 'lucide-react';
import '../../styles/chat.css';

export default function ChatPlainCSS({
  messages = [],
  isLoading = false,
  onSendMessage,
  onNewChat,
  className = ''
}) {
  const [inputValue, setInputValue] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className={`chat-shell ${className}`}>
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-content">
          <div className="chat-avatar">AI</div>
          <div>
            <h1 className="chat-title">znozx</h1>
            <p className="chat-subtitle">AI Budyy</p>
          </div>
        </div>
        <button
          onClick={onNewChat}
          className="chat-new-button"
          aria-label="Start new chat"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <div className="chat-empty-content">
              <div className="chat-empty-avatar">AI</div>
              <h2 className="chat-empty-title">How can I help you today?</h2>
              <p className="chat-empty-subtitle">
                Start a conversation by typing a message below.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${
                message.role === 'user' ? 'chat-message--user' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`chat-message-avatar ${
                  message.role === 'user'
                    ? 'chat-message-avatar--user'
                    : 'chat-message-avatar--ai'
                }`}
              >
                {message.role === 'user' ? 'U' : 'AI'}
              </div>

              {/* Message Content */}
              <div
                className={`chat-message-content ${
                  message.role === 'user' ? 'chat-message-content--user' : ''
                }`}
              >
                <div
                  className={`chat-message-bubble ${
                    message.role === 'user'
                      ? 'chat-message-bubble--user'
                      : 'chat-message-bubble--ai'
                  }`}
                >
                  {message.content}
                </div>
                <p className="chat-message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="chat-typing">
            <div className="chat-message-avatar chat-message-avatar--ai">AI</div>
            <div className="chat-message-content">
              <div className="chat-message-bubble chat-message-bubble--ai">
                <div className="chat-typing-dots">
                  <div className="chat-typing-dot"></div>
                  <div className="chat-typing-dot"></div>
                  <div className="chat-typing-dot"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message znozx..."
                disabled={isLoading}
                rows={1}
                className="chat-input"
                aria-label="Message input"
              />
              <div className="chat-input-actions">
                <button
                  type="button"
                  className="chat-input-action"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="chat-input-action"
                  aria-label="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="chat-send-button"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Floating New Message Indicator */}
      {messages.length > 0 && (
        <button
          onClick={onNewChat}
          className="chat-floating-button"
          aria-label="Start new chat"
        >
          <Plus className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
