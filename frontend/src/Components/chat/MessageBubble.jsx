import React from 'react';
import { motion } from 'framer-motion';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css'; // Import Katex CSS
import '../../styles/message-bubble.css';

export default function MessageBubble({ message, isUser = false }) {
  const renderMarkdown = (text) => (
    <ReactMarkdown
      children={text}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="inline-code" {...props}>
              {children}
            </code>
          );
        },
      }}
    />
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`message-bubble-container ${isUser ? 'message-bubble-container--user' : ''}`}
    >
      {/* Avatar */}
      <div className={`message-bubble-avatar ${isUser ? 'message-bubble-avatar--user' : 'message-bubble-avatar--ai'}`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className={`message-bubble-content ${isUser ? 'message-bubble-content--user' : ''}`}>
        <div className={`message-bubble-bubble ${isUser ? 'message-bubble-bubble--user' : 'message-bubble-bubble--ai'}`}>
          {renderMarkdown(message.content)}
        </div>
        <span className="message-bubble-time">
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </motion.div>
  );
}
