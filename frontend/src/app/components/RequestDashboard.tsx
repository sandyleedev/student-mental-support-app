import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronDown,
  Filter,
  MessageSquare,
} from "lucide-react";
import { useEffect, useState } from "react";

interface Thread {
  id: number;
  student_id: number;
  topic: string;
  status: "WAITING" | "REPLIED";
  urgency_level: "urgent" | "medium" | "low";
  updated_at: string;
}

export function CounselorDashboard({
  onSelectThread,
}: {
  onSelectThread?: (threadId: number) => void;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("WAITING");

  useEffect(() => {
    const fetchThreads = async () => {
      try {
        const counselorId = localStorage.getItem("user_id") || "3";
        const response = await fetch(
          `http://localhost:5001/api/threads?user_id=${counselorId}&status=${statusFilter}`,
        );
        const data = await response.json();

        const sortedThreads = (data.threads || []).sort(
          (a: Thread, b: Thread) => {
            const urgencyOrder = { urgent: 0, medium: 1, low: 2 };
            return (
              urgencyOrder[a.urgency_level] - urgencyOrder[b.urgency_level]
            );
          },
        );

        setThreads(sortedThreads);
      } catch (error) {
        console.error("Failed to fetch threads:", error);
      }
    };
    fetchThreads();
  }, [statusFilter]);

  const handleActionClick = async (threadId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "WAITING" ? "REPLIED" : "CLOSED";
      const response = await fetch(
        `http://localhost:5001/api/threads/${threadId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );

      if (response.ok) {
        const updatedThread = await response.json();
        setThreads((prevThreads) =>
          prevThreads.map((thread) =>
            thread.id === threadId
              ? {
                  ...thread,
                  status: updatedThread.status as "WAITING" | "REPLIED",
                }
              : thread,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update thread status:", error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-100 text-red-700 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    return status === "WAITING"
      ? "bg-blue-100 text-blue-700 border-blue-300"
      : "bg-green-100 text-green-700 border-green-300";
  };

  const getRowBgColor = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return "bg-red-50 hover:bg-red-100";
      case "medium":
        return "bg-yellow-50 hover:bg-yellow-100";
      case "low":
        return "bg-gray-50 hover:bg-gray-100";
      default:
        return "hover:bg-gray-50";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-gray-200 px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Student Request Queue
              </h2>
              <p className="text-sm text-gray-500">
                View and respond to incoming support threads
              </p>
            </div>
          </div>

          {/* API Filters */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Status Filter:</span>
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="WAITING">Waiting (Pending)</option>
                <option value="REPLIED">Replied (History)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </header>

        <div className="p-8">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    Student (ID)
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    Topic
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    Urgency
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    Last Updated
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {threads.map((thread) => (
                  <tr
                    key={thread.id}
                    className={`transition-all ${
                      thread.urgency_level === "urgent"
                        ? "bg-red-50 hover:bg-red-100 shadow-lg  border-2 border-red-200"
                        : getRowBgColor(thread.urgency_level)
                    }`}
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium text-center">
                      <div className="flex items-center justify-center gap-2">
                        Student #{thread.student_id}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-md truncate text-center">
                      {thread.topic}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`w-25 px-4 py-2 rounded-full text-xs font-bold border-2 inline-block ${
                          thread.urgency_level === "urgent"
                            ? "bg-red-100 text-red-700 border-red-500 shadow-md"
                            : getUrgencyColor(thread.urgency_level)
                        }`}
                      >
                        {thread.urgency_level === "urgent" && "🔴 "}
                        {thread.urgency_level === "medium" && "🟡 "}
                        {thread.urgency_level === "low" && "🟢 "}
                        {thread.urgency_level.charAt(0).toUpperCase() +
                          thread.urgency_level.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(thread.updated_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs border font-medium inline-block ${getStatusColor(thread.status)}`}
                      >
                        {thread.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => {
                          if (thread.status === "WAITING") {
                            onSelectThread?.(thread.id);
                          } else {
                            handleActionClick(thread.id, thread.status);
                          }
                        }}
                        className={`p-2 rounded-lg transition-colors inline-flex items-center justify-center ${
                          thread.status === "WAITING"
                            ? "text-blue-600 hover:bg-blue-50"
                            : "text-green-600 hover:bg-green-50"
                        }`}
                        title={thread.status === "WAITING" ? "Reply" : "Close"}
                      >
                        {thread.status === "WAITING" ? (
                          <MessageSquare className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {threads.length === 0 && (
              <div className="py-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No requests found</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
