// src/pages/ChatPage.tsx
import React from "react";
import ChatInterface from "@/components/chat/ChatInterface";

const ChatPage: React.FC = () => {
  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Style Assistant</h1>
        <p className="text-gray-600 mt-2">
          Get personalized fashion advice and outfit recommendations
        </p>
      </div>
      <div className="h-full">
        <ChatInterface />
      </div>
    </div>
  );
};

export default ChatPage;
