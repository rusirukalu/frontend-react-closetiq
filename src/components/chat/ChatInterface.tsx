import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Image, Sparkles } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
  context?: {
    images?: string[];
    recommendations?: any[];
  };
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hi! I'm your AI Style Assistant. I can help you with outfit recommendations, style advice, color matching, and fashion questions. What would you like to know?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputValue);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: "assistant",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes("color") || input.includes("match")) {
      return "Great question about color matching! Here are some tips:\n\n• **Complementary colors** like blue and orange work beautifully together\n• **Neutrals** (black, white, gray, beige) go with almost everything\n• **Monochromatic** looks using different shades of the same color are always elegant\n• **The 60-30-10 rule**: 60% main color, 30% secondary, 10% accent\n\nWould you like specific advice for any colors you're working with?";
    }

    if (input.includes("outfit") || input.includes("wear")) {
      return "I'd love to help you put together an outfit! To give you the best recommendations, could you tell me:\n\n• What's the occasion? (work, date, casual, etc.)\n• What's the weather like?\n• Do you have any specific pieces you want to include?\n• What's your style preference?\n\nOr feel free to upload photos of items you're considering!";
    }

    if (input.includes("style") || input.includes("fashion")) {
      return "Fashion and style are all about expressing your personality! Here are some universal style tips:\n\n• **Fit is everything** - well-fitting clothes always look better\n• **Invest in basics** - quality white shirts, good jeans, classic blazers\n• **Accessories matter** - they can transform a simple outfit\n• **Confidence is key** - wear what makes you feel great\n\nWhat specific style area would you like to explore?";
    }

    if (input.includes("work") || input.includes("professional")) {
      return "Professional dressing is about looking polished and appropriate:\n\n• **Classic pieces**: blazers, dress pants, button-down shirts\n• **Neutral colors**: navy, black, gray, white, cream\n• **Quality fabrics**: wool, cotton, silk blends\n• **Proper fit**: tailored but not tight\n• **Minimal accessories**: classic watch, simple jewelry\n\nAre you looking for advice for a specific workplace dress code?";
    }

    return "That's interesting! I'm here to help with all your fashion and style questions. Some things I can assist with:\n\n• **Outfit coordination** and color matching\n• **Style advice** for different occasions\n• **Fashion trends** and timeless pieces\n• **Wardrobe planning** and organization\n• **Shopping recommendations**\n\nWhat specific fashion topic would you like to explore?";
  };

  const quickQuestions = [
    "What colors go with navy blue?",
    "What should I wear to work?",
    "How do I style a black dress?",
    "What's my style personality?",
    "Casual outfit ideas?",
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-fashion-pink rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Style Assistant</h3>
            <p className="text-sm text-gray-500">Online • Ready to help</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-500">AI Active</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex max-w-xs lg:max-w-md ${
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              {/* Avatar */}
              <div
                className={`flex-shrink-0 ${
                  message.role === "user" ? "ml-2" : "mr-2"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "user"
                      ? "bg-primary-500"
                      : "bg-gradient-to-r from-primary-500 to-fashion-pink"
                  }`}
                >
                  {message.role === "user" ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              {/* Message */}
              <div
                className={`px-4 py-2 rounded-2xl ${
                  message.role === "user"
                    ? "bg-primary-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <div className="text-sm whitespace-pre-line">
                  {message.content}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    message.role === "user"
                      ? "text-primary-100"
                      : "text-gray-500"
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex justify-start"
            >
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-fashion-pink rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-2xl px-4 py-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="p-4 border-t border-gray-100">
          <p className="text-sm text-gray-600 mb-3">
            Quick questions to get started:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => setInputValue(question)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors duration-200"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me anything about fashion and style..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className="px-4"
          >
            {isTyping ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
              <Image className="w-4 h-4" />
              <span>Upload image</span>
            </button>
            <button className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700">
              <Sparkles className="w-4 h-4" />
              <span>Get outfit suggestions</span>
            </button>
          </div>
          <p className="text-xs text-gray-400">AI-powered fashion assistant</p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
