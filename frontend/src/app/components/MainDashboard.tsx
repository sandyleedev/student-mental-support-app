/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Bell,
  Calendar,
  ChevronDown,
  ClipboardList,
  Clock,
  Heart,
  Lock,
  LogOut,
  Mail,
  MessageCircle,
  Settings,
} from "lucide-react";
import { useEffect, useState } from "react";
import { CounselorChat } from "./CounselorChat.tsx";
import { CounselorDashboard } from "./CounselorDashboard.tsx";
import { MyBookings } from "./MyBookings.tsx";
import { StudentBooking } from "./StudentBooking.tsx";
import { StudentChat } from "./StudentChat.tsx";
import { SupportRequestForm } from "./SupportRequestForm.tsx";
import { TeamRota } from "./TeamRota.tsx";
import { WellbeingDashboard } from "./WellbeingDashboard.tsx";

type UserRole = "student" | "counselor";
type StudentView = "request" | "conversations" | "booking" | "my-bookings";
type TeamView = "queue" | "chats" | "activities" | "rota";

export function MainDashboard() {
  const [email, setEmail] = useState("emily@test.com");
  const [password, setPassword] = useState("123456");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>("student");
  const [studentView, setStudentView] = useState<StudentView>("request");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<number | undefined>(
    undefined,
  );
  const [teamView, setTeamView] = useState<TeamView>("queue");
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const [studentsRes, counselorsRes] = await Promise.all([
        fetch("http://127.0.0.1:5001/api/users?role=STUDENT"),
        fetch("http://127.0.0.1:5001/api/users?role=COUNSELOR"),
      ]);
      const students = (await studentsRes.json()).users || [];
      const counselors = (await counselorsRes.json()).users || [];
      setUsers([...students, ...counselors]);
    };
    fetchUsers();
  }, []);

  const userName = localStorage.getItem("user_name") || "User";
  const userAvatar = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const handleAuthLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const matchedUser = users.find(
        (user) => user.email === email && "123456" === password,
      );

      if (matchedUser) {
        localStorage.setItem("user_id", matchedUser.id.toString());
        localStorage.setItem(
          "role",
          matchedUser.role.toLowerCase() === "student"
            ? "student"
            : "counselor",
        );
        localStorage.setItem("user_name", matchedUser.name);

        setUserRole(
          matchedUser.role.toLowerCase() === "student"
            ? "student"
            : "counselor",
        );
        setIsLoggedIn(true);

        if (matchedUser.role.toLowerCase() === "student") {
          setStudentView("request");
        } else {
          setTeamView("queue");
        }
      } else {
        setLoginError("Invalid email or password. Please try again.");
      }
    } catch (error) {
      console.error("Login process failed:", error);
      setLoginError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = () => {
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    localStorage.removeItem("user_id");
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    setEmail("");
    setPassword("");
  };

  const renderMainContent = () => {
    if (userRole === "student") {
      if (studentView === "booking") {
        return <StudentBooking />;
      }
      if (studentView === "my-bookings")
        return <MyBookings onBookNew={() => setStudentView("booking")} />;
      if (studentView === "conversations") {
        return <StudentChat />;
      }
      return <SupportRequestForm />;
    }

    if (userRole === "counselor") {
      if (teamView === "activities") {
        return <WellbeingDashboard />;
      }
      if (teamView === "rota") {
        return <TeamRota />;
      }
      if (teamView === "chats") {
        return (
          <CounselorChat
            selectedThreadId={selectedThreadId}
            onBack={() => {
              setTeamView("queue");
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
            setTeamView("chats");
          }}
        />
      );
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-green-50 font-sans px-4">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
              <Heart className="text-white w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to CampusCompass
            </h2>
            <p className="text-gray-500 text-sm">
              Please sign in to your account
            </p>
          </div>

          <form onSubmit={handleAuthLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                  placeholder="name@test.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                  placeholder="••••••"
                />
              </div>
            </div>

            {loginError && (
              <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
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
                className={`w-2 h-2 rounded-full ${userRole === "student" ? "bg-green-500" : "bg-green-500"}`}
              />
              {userRole === "student" ? "Student Portal" : "Staff Portal"}
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
                  <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs">
                    {userAvatar}
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
                <button
                  onClick={() => setStudentView("booking")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    studentView === "booking"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Calendar className="w-5 h-5" /> Book Appointment
                </button>
                <button
                  onClick={() => setStudentView("my-bookings")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    studentView === "my-bookings"
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ClipboardList className="w-5 h-5" /> My Bookings
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setTeamView("queue")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    teamView === "queue"
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ClipboardList className="w-5 h-5" /> Request Queue
                </button>
                <button
                  onClick={() => setTeamView("chats")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    teamView === "chats"
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <MessageCircle className="w-5 h-5" /> My Chats
                </button>

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Management
                  </p>
                  <button
                    onClick={() => setTeamView("activities")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      teamView === "activities"
                        ? "bg-green-50 text-green-700 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Calendar className="w-5 h-5" /> Workshop
                  </button>
                  <button
                    onClick={() => setTeamView("rota")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${teamView === "rota" ? "bg-green-50 text-green-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <Clock className="w-5 h-5" /> Counselling sessions
                  </button>
                </div>
              </>
            )}
          </nav>
        </aside>
        <main className="flex-1 overflow-auto p-6">{renderMainContent()}</main>
      </div>
    </div>
  );
}
