import React, { useState, useRef, useEffect } from 'react';
import { vishuApi } from '../api/brahma';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface VishuChatProps {
  workflowId?: string;
  className?: string;
}

const VishuChat: React.FC<VishuChatProps> = ({ workflowId, className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm Vishu, your intelligent infrastructure analyst. I can help you understand your Terraform code, suggest improvements, and answer questions about your infrastructure. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await vishuApi.chat(inputMessage, workflowId);

      if (response.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: response.message,
          timestamp: response.timestamp,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(response.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickQuestions = [
    "How can I improve security?",
    "What are the cost optimization opportunities?",
    "Explain the architecture design",
    "Are there any performance issues?",
  ];

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="card-retro border-b border-pixel/30 px-6 py-4 rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-primary to-purple-600 flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h3 className="text-lg font-bold text-retro-white" className="font-heading">
              Vishu Agent
            </h3>
            <p className="text-xs text-retro-cyan opacity-60">Infrastructure Analyst & Advisor</p>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 card-retro">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-retro-cyan text-retro-white'
                  : 'border-pixel bg-retro-dark border border-pixel/30 text-retro-cyan'
              }`}
            >
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </div>
              <div
                className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-retro-cyan' : 'text-retro-cyan opacity-50'
                }`}
              >
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="border-pixel bg-retro-dark border border-pixel/30 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-retro-cyan opacity-60">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-retro-cyan rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-retro-cyan rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-retro-cyan rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <span className="text-sm">Vishu is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-6 py-3 card-retro border-t border-pixel/20">
          <p className="text-xs text-retro-cyan opacity-60 mb-2 font-semibold uppercase tracking-wide">
            Quick Questions:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question)}
                className="text-xs px-3 py-1.5 rounded-lg border-pixel bg-retro-dark border border-pixel/30 text-retro-cyan opacity-80 hover:bg-retro-cyan/20 hover:border-pixel/50 transition-all"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="card-retro border-t border-pixel/30 px-6 py-4 rounded-b-2xl">
        <div className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Vishu about your infrastructure..."
            disabled={isLoading}
            className="flex-1 bg-transparent border border-pixel/30 rounded-xl px-4 py-3 text-retro-cyan placeholder-vintage-white/50 focus:outline-none focus:ring-2 focus:ring-blue-primary/50 focus:border-pixel/50 transition-all"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-retro-cyan hover:bg-retro-cyan/80 disabled:bg-retro-dark/50 disabled:cursor-not-allowed text-retro-white px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg hover:shadow-vintage-red/40"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VishuChat;
