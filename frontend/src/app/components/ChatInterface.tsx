import { MessageCircle, Paperclip, Search, Send } from "lucide-react";
import { useEffect, useState } from "react";

interface Message {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
  status?: "sent" | "delivered" | "read";
}

interface Thread {
  id: number;
  student_id: number;
  topic: string;
  status: "WAITING" | "REPLIED";
  created_at: string;
  updated_at: string;
}

interface Conversation {
  id: string;
  studentName: string;
  studentAvatar: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isOnline: boolean;
}

export function ChatInterface({
  selectedThreadId,
  userRole = "counselor",
}: {
  selectedThreadId?: number;
  onBack?: () => void;
  userRole?: "student" | "counselor";
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string>(
    selectedThreadId?.toString() || "",
  );
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (userRole === "counselor") {
      const fetchThreads = async () => {
        try {
          const counselorId = localStorage.getItem("user_id") || "3";
          const response = await fetch(
            `http://localhost:5001/api/threads?user_id=${counselorId}&status=ALL`,
          );
          const data = await response.json();
          const formattedConversations = data.threads.map((thread: Thread) => ({
            id: thread.id.toString(),
            studentName: `Student #${thread.student_id}`,
            studentAvatar: `S${thread.student_id}`,
            lastMessage: thread.topic,
            timestamp: new Date(thread.updated_at).toLocaleDateString(),
            unreadCount: 0,
            isOnline: true,
          }));
          setConversations(formattedConversations);
        } catch (error) {
          console.error("Failed to fetch threads:", error);
        }
      };
      fetchThreads();
    }
  }, [userRole]);

  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/threads/${selectedConversation}`,
        );
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };
    fetchMessages();
  }, [selectedConversation]);

  const handleSendMessage = async () => {
    if (messageInput.trim() && selectedConversation) {
      try {
        const userId = localStorage.getItem("user_id") || "3";
        const response = await fetch(
          `http://localhost:5001/api/threads/${selectedConversation}/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sender_id: parseInt(userId),
              content: messageInput,
            }),
          },
        );

        if (response.ok) {
          const newMessage = await response.json();
          setMessages([...messages, newMessage]);
          setMessageInput("");
        }
      } catch (error) {
        console.error("Failed to send message:", error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentConversation = conversations.find(
    (c) => c.id === selectedConversation,
  );

  return (
    <div>
      <div className="h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
          {/* Sidebar */}
          <div
            className={
              "md:translate-x-0 fixed md:relative z-30 w-80 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300"
            }
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-6 h-6 text-blue-500" />
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                    CampusCompass
                  </h1>
                </div>
                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
                >
                  {isDarkMode ? "☀️" : "🌙"}
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation.id)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedConversation === conversation.id ? "bg-blue-50 dark:bg-gray-700" : ""}`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                    {conversation.studentAvatar}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex justify-between mb-1">
                      <h3 className="text-sm font-medium dark:text-white truncate">
                        {conversation.studentName}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white">
                  {currentConversation?.studentAvatar || "S"}
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    {currentConversation?.studentName ||
                      "Select a conversation"}
                  </h2>
                  <p className="text-xs text-green-500">Active Thread</p>
                </div>
              </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {messages.map((message) => {
                const isCounselor = message.sender_id === 3;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isCounselor ? "justify-end" : "justify-start"}`}
                  >
                    <div className="max-w-[70%]">
                      <div
                        className={`px-4 py-2 rounded-2xl ${isCounselor ? "bg-blue-500 text-white rounded-br-md" : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md"}`}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>
                      <div
                        className={`flex mt-1 px-1 ${isCounselor ? "justify-end" : "justify-start"}`}
                      >
                        <span className="text-[10px] text-gray-500">
                          {new Date(message.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-end gap-2">
                <button className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Paperclip className="w-5 h-5" />
                </button>
                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                  <textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    rows={1}
                    className="w-full bg-transparent border-none outline-none text-sm py-1"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  className="p-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 rounded-lg text-white"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
