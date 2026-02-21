import {
  Bell,
  ChevronDown,
  ClipboardList,
  Heart,
  LogOut,
  MessageCircle,
  Settings,
  User,
} from "lucide-react";
import { useState } from "react";
import { ChatInterface } from "./ChatInterface";
import { CounselorDashboard } from "./CounselorDashboard.tsx";
import { MyConversations } from "./MyConversations.tsx";
import { SupportRequestForm } from "./SupportRequestForm.tsx";

type UserRole = "student" | "counselor";
type CounselorView = "chats" | "queue";
type StudentView = "request" | "conversations";

export function MainDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [counselorView, setCounselorView] = useState<CounselorView>("queue");
  const [studentView, setStudentView] = useState<StudentView>("request");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<number | undefined>(
    undefined,
  );

  const userData = {
    student: {
      name: "Rory Gilmore",
      id: "STU-2024-001",
      avatar: "RG",
    },
    counselor: {
      name: "Dr. Sarah Mitchell",
      role: "Senior Counselor",
      avatar: "SM",
    },
  };

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    localStorage.setItem("user_id", role === "student" ? "1" : "3");
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    localStorage.removeItem("user_id");
  };

  const currentUser =
    userRole === "student" ? userData.student : userData.counselor;

  const renderMainContent = () => {
    if (userRole === "student") {
      return studentView === "conversations" ? (
        <MyConversations />
      ) : (
        <SupportRequestForm />
      );
    }

    if (userRole === "counselor") {
      if (counselorView === "chats") {
        return (
          <ChatInterface
            selectedThreadId={selectedThreadId}
            onBack={() => {
              setCounselorView("queue");
              setSelectedThreadId(undefined);
            }}
            userRole="counselor"
          />
        );
      }
      return (
        <CounselorDashboard
          onSelectThread={(threadId) => {
            setSelectedThreadId(threadId);
            setCounselorView("chats");
          }}
        />
      );
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 font-sans">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-white/20 text-center">
          <div className="w-20 h-20 bg-blue-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200">
            <Heart className="text-white w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            CampusCompass
          </h2>
          <p className="text-gray-500 mb-10">
            Please select your role to enter the system
          </p>

          <div className="space-y-4">
            <button
              onClick={() => handleLogin("student")}
              className="w-full flex items-center justify-center gap-4 p-5 border-2 border-blue-100 bg-blue-50/30 text-blue-700 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <User className="w-6 h-6" />
              </div>
              <span className="text-lg font-semibold">I am a Student</span>
            </button>

            <button
              onClick={() => handleLogin("counselor")}
              className="w-full flex items-center justify-center gap-4 p-5 border-2 border-green-100 bg-green-50/30 text-green-700 rounded-2xl hover:border-green-500 hover:bg-green-50 transition-all duration-300 group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors">
                <Heart className="w-6 h-6" />
              </div>
              <span className="text-lg font-semibold">I am a Counselor</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <nav className="bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900 hidden sm:block">
                CampusCompass
              </h1>
            </div>

            <div className="px-4 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-600 flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${userRole === "student" ? "bg-blue-500" : "bg-green-500"}`}
              />
              {userRole === "student" ? "Student Portal" : "Counselor Portal"}
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Bell className="w-5 h-5" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 pl-2 py-1 hover:bg-gray-100 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
                    {currentUser.avatar}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border py-2 z-20">
                    <button className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2">
                      <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button
                      onClick={handleSignOut}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <nav className="flex-1 p-4 space-y-1">
            {userRole === "student" ? (
              <>
                <button
                  onClick={() => setStudentView("request")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    studentView === "request"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ClipboardList className="w-5 h-5" /> New Request
                </button>
                <button
                  onClick={() => setStudentView("conversations")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    studentView === "conversations"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" /> My Conversations
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setCounselorView("queue")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    counselorView === "queue"
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ClipboardList className="w-5 h-5" /> Request Queue
                </button>
                <button
                  onClick={() => setCounselorView("chats")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    counselorView === "chats"
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" /> My Chats
                </button>
              </>
            )}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-6">{renderMainContent()}</main>
      </div>
    </div>
  );
}
