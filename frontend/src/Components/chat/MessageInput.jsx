import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import '../../styles/message-input.css';

export default function MessageInput({ onSendMessage, disabled = false }) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="message-input-area">
      <form onSubmit={handleSubmit} className="message-input-form">
        <div className="message-input-container">
          <div className="message-input-wrapper">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message znozx..."
              disabled={disabled}
              rows={1}
              className="message-input"
              aria-label="Message input"
            />
            <div className="message-input-actions">
              <button
                type="button"
                className="message-input-action"
                aria-label="Attach file"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <button
                type="button"
                className="message-input-action"
                aria-label="Add emoji"
              >
                <Smile className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={!message.trim() || disabled}
            className="message-send-button"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}