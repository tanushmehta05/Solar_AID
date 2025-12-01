
import React, { useState, useRef, useEffect } from "react";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { SendIcon, Bot, User, Loader2, RefreshCw } from "lucide-react";
import { sendChatMessage } from "@/services/chatService";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your Solar Panel AI Assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsProcessing(true);
    
    try {
      const response = await sendChatMessage(input, messages);
      
      const botMessage: Message = {
        role: "assistant",
        content: response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get a response. Please try again.",
      });
      
      console.error("Chat error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const resetConversation = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello! I'm your Solar Panel AI Assistant. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    toast({
      title: "Conversation reset",
      description: "Started a new conversation",
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10">
        <Card className="mx-auto max-w-4xl shadow-lg border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="h-6 w-6 text-solar-blue mr-2" />
                <div>
                  <CardTitle>Solar Panel Assistant</CardTitle>
                  <CardDescription>Powered by Gemini AI</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={resetConversation} title="Reset conversation">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] overflow-y-auto pr-4 space-y-4 mb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex max-w-[80%] ${
                      message.role === "user"
                        ? "flex-row-reverse"
                        : "flex-row"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center h-8 w-8 rounded-full mr-2 ${
                        message.role === "user"
                          ? "bg-solar-blue ml-2"
                          : "bg-gray-200"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-gray-700" />
                      )}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-lg ${
                        message.role === "user"
                          ? "bg-solar-blue text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div className="text-xs mt-1 opacity-70">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="flex max-w-[80%] flex-row">
                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-200 mr-2">
                      <Bot className="h-4 w-4 text-gray-700" />
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-gray-100 text-gray-800">
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
          <CardFooter>
            <form onSubmit={handleSendMessage} className="w-full">
              <div className="flex space-x-2">
                <Input
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isProcessing}
                  className="flex-1"
                />
                <Button type="submit" disabled={!input.trim() || isProcessing}>
                  <SendIcon className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Chat;
