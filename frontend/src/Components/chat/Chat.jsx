import React from 'react';
import { Send, Paperclip, Smile, Plus } from 'lucide-react';

export default function Chat({
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
    <div className={`chat-shell flex flex-col h-full bg-white dark:bg-gray-900 ${className}`}>
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
            <span className="text-sm font-semibold text-white">znozxE</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">znozx</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Your Jarvis </p>
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
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="max-w-md text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-500 rounded-full">
                <span className="text-2xl font-bold text-white">znozxE</span>
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
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
              className={`flex gap-3 max-w-4xl mx-auto ${
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'user'
                  ? 'bg-green-500'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
                {message.role === 'user' ? (
                  <span className="text-sm font-semibold text-white">U</span>
                ) : (
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">AI</span>
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  className={`inline-block px-4 py-3 rounded-2xl shadow-sm max-w-2xl ${
                    message.role === 'user'
                      ? 'bg-green-500 text-white rounded-br-md'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
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
          <div className="flex max-w-4xl gap-3 mx-auto">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full dark:bg-gray-700">
              <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">AI</span>
            </div>
            <div className="flex-1">
              <div className="inline-block px-4 py-3 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700 rounded-2xl rounded-bl-md">
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
      <div className="p-4 bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-900">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message znozx..."
                disabled={isLoading}
                rows={1}
                className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-2xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none min-h-[44px] max-h-32 shadow-sm"
                style={{ minHeight: '44px' }}
                aria-label="Message input"
              />
              <div className="absolute flex gap-1 transform -translate-y-1/2 right-3 top-1/2">
                <button
                  type="button"
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="flex items-center justify-center text-white transition-colors bg-green-500 rounded-full shadow-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed w-11 h-11 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Floating New Message Indicator */}
      {messages.length > 0 && (
        <div className="absolute bottom-20 right-4">
          <button
            onClick={onNewChat}
            className="flex items-center justify-center w-12 h-12 text-white transition-all bg-green-500 rounded-full shadow-lg hover:bg-green-600 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            aria-label="Start new chat"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}


