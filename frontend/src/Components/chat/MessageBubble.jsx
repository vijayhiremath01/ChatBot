import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import '../../styles/message-bubble.css';

export default function MessageBubble({ message, isUser = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`message-bubble-container ${
        isUser ? 'message-bubble-container--user' : ''
      }`}
    >
      {/* Avatar */}
      <div className={`message-bubble-avatar ${
        isUser ? 'message-bubble-avatar--user' : 'message-bubble-avatar--ai'
      }`}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>
      
      {/* Message Content */}
      <div className={`message-bubble-content ${
        isUser ? 'message-bubble-content--user' : ''
      }`}>
        <div className={`message-bubble-bubble ${
          isUser ? 'message-bubble-bubble--user' : 'message-bubble-bubble--ai'
        }`}>
          {message.content}
        </div>
        <span className="message-bubble-time">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </motion.div>
  );
}