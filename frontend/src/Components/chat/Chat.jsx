import React from 'react';
import { Send, Paperclip, Smile, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';

export default function Chat({ messages = [], isLoading = false, onSendMessage, onNewChat, className = '' }) {
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

  // Render markdown + math with tighter spacing
  const renderMarkdown = (text) => (
    <ReactMarkdown
      children={text}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeKatex]}
      components={{
        p: ({ node, children, ...props }) => (
          <p className="m-0 leading-tight" {...props}>{children}</p>
        ),
        li: ({ node, children, ...props }) => (
          <li className="ml-4 mb-0 leading-tight list-disc" {...props}>{children}</li>
        ),
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              customStyle={{ margin: 0, padding: '0.5em 0.8em', borderRadius: '0.5rem' }}
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className="inline-code bg-gray-200 dark:bg-gray-700 rounded px-1 py-[1px]" {...props}>
              {children}
            </code>
          );
        },
      }}
    />
  );

  return (
    <div className={`chat-shell flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
            <span className="text-sm font-semibold text-white">znozxE</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">znozx</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your Jarvis</p>
          </div>
        </div>
        <button
          onClick={onNewChat}
          className="p-2 text-gray-500 transition-colors rounded-lg hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          aria-label="Start new chat"
        >
          <Plus className="w-5 h-5" />
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-2 bg-green-500 rounded-full">
                <span className="text-2xl font-bold text-white">znozxE</span>
              </div>
              <h2 className="mb-1 text-xl font-semibold text-gray-900 dark:text-white">
                How can I help you today?
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start a conversation by typing a message below.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-2 max-w-4xl mx-auto ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user' ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {message.role === 'user' ? (
                  <span className="text-sm font-semibold text-white">U</span>
                ) : (
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">AI</span>
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-3 py-2 rounded-2xl shadow-sm max-w-2xl ${
                  message.role === 'user'
                    ? 'bg-green-500 text-white rounded-br-md'
                    : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md'
                }`}>
                  {renderMarkdown(message.content)}
                </div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex max-w-4xl gap-2 mx-auto">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full dark:bg-gray-700">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">AI</span>
            </div>
            <div className="flex-1">
              <div className="inline-block px-3 py-2 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 rounded-2xl rounded-bl-md">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message znozx..."
                disabled={isLoading}
                rows={1}
                className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none min-h-[40px] max-h-28 shadow-sm"
                aria-label="Message input"
              />
              <div className="absolute flex gap-1 transform -translate-y-1/2 right-2 top-1/2">
                <button type="button" className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500" aria-label="Attach file">
                  <Paperclip className="w-4 h-4" />
                </button>
                <button type="button" className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500" aria-label="Add emoji">
                  <Smile className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="flex items-center justify-center text-white transition-colors bg-green-500 rounded-full shadow-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed w-10 h-10 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
