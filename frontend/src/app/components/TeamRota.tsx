/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  List,
  Lock,
  Trash2,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type Activity = {
  id: string;
  title: string;
  type: "session" | "workshop";
  category: string;
  date: string;
  time: string;
  duration: string;
  capacity: number;
  booked: number;
  status: "upcoming" | "ongoing" | "completed";
  facilitator: string;
  participants?: {
    id: string;
    name: string;
    email: string;
  }[];
};

const API_BASE = "http://localhost:5001/api";

export function TeamRota() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");

  const [currentMonthDate, setCurrentMonthDate] = useState(
    new Date("2026-03-01"),
  );
  const baseMonthDate = new Date("2026-03-01");

  const currentCounselor = localStorage.getItem("user_name") || "Emily Gilmore";

  // Modal & Edit State
  const [modalMode, setModalMode] = useState<"edit" | "cancel" | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    date: "",
    time: "",
    duration: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/activities?type=session`);

        if (response.ok) {
          const data = await response.json();
          const fetchedData =
            data.activities || (Array.isArray(data) ? data : []);

          const mappedActivities = fetchedData.map((a: any) => ({
            id: String(a.id),
            title: a.title || "1-on-1 Counseling",
            type: "session",
            category: a.category || "General Support",
            date: a.date || (a.start_time ? a.start_time.split("T")[0] : ""),
            time:
              a.time ||
              (a.start_time ? a.start_time.split("T")[1].substring(0, 5) : ""),
            duration: a.duration || "50 min",
            capacity: a.capacity || 1,
            booked: a.booked || (a.participants?.length > 0 ? 1 : 0),
            status: a.status || "upcoming",
            facilitator: a.facilitator,
            studentName: a.studentName || a.participants?.[0]?.name,
          }));

          setActivities(mappedActivities);
        }
      } catch (error) {
        console.error("Error fetching rota:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const myRota = activities.filter(
    (a) => a.type === "session" && a.facilitator === currentCounselor,
  );
  const bookedCount = myRota.filter((a) => a.booked > 0).length;

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const padding = firstDay === 0 ? 6 : firstDay - 1;

  const diffMonths =
    (year - baseMonthDate.getFullYear()) * 12 +
    (month - baseMonthDate.getMonth());
  const isNextDisabled = diffMonths >= 2;
  const isPrevDisabled = currentMonthDate <= baseMonthDate;

  const handlePrevMonth = () => {
    if (!isPrevDisabled) {
      setCurrentMonthDate(new Date(year, month - 1, 1));
    }
  };

  const handleNextMonth = () => {
    if (!isNextDisabled) {
      setCurrentMonthDate(new Date(year, month + 1, 1));
    }
  };

  const formatYYYYMMDD = (d: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  };

  // Edit handlers
  const handleOpenEditModal = (activity: Activity) => {
    setSelectedActivity(activity);
    setEditForm({
      date: activity.date,
      time: activity.time,
      duration: activity.duration,
    });
    setModalMode("edit");
  };

  const handleOpenCancelModal = (activity: Activity) => {
    setSelectedActivity(activity);
    setModalMode("cancel");
  };

  const handleSaveEdit = async () => {
    if (!selectedActivity) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE}/activities/${selectedActivity.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: editForm.date,
            time: editForm.time,
            duration: editForm.duration,
          }),
        },
      );

      if (response.ok) {
        setActivities((prev) =>
          prev.map((a) =>
            a.id === selectedActivity.id ? { ...a, ...editForm } : a,
          ),
        );
        setModalMode(null);
        setSelectedActivity(null);
      } else {
        alert("Failed to save changes.");
      }
    } catch (error) {
      console.error("Error saving activity:", error);
      alert("Error saving activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmCancel = async () => {
    if (!selectedActivity) return;
    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${API_BASE}/activities/${selectedActivity.id}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        setActivities((prev) =>
          prev.filter((a) => a.id !== selectedActivity.id),
        );
        setModalMode(null);
        setSelectedActivity(null);
      } else {
        alert("Failed to cancel activity.");
      }
    } catch (error) {
      console.error("Error cancelling activity:", error);
      alert("Error cancelling activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-10 mt-2">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Schedule (Rota)
            </h1>
            <p className="text-gray-500 text-sm">
              View assigned counseling slots and check upcoming appointments.
            </p>
          </div>

          <div className="flex justify-center w-full">
            <div className="relative flex p-1 bg-gray-100/80 rounded-full border border-gray-200/60 w-75 shadow-inner">
              <div
                className={`absolute top-1 bottom-1 left-1 w-[calc(50%-4px)] bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.1)] border border-gray-200/50 transition-transform duration-300 ease-out ${
                  viewMode === "calendar" ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <button
                onClick={() => setViewMode("list")}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-colors duration-200 ${
                  viewMode === "list"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" /> List
              </button>
              <button
                onClick={() => setViewMode("calendar")}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-2 text-sm font-semibold transition-colors duration-200 ${
                  viewMode === "calendar"
                    ? "text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <CalendarDays className="w-4 h-4" /> Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Next Appointment
              </p>
              {myRota.find(
                (a) =>
                  a.booked > 0 && new Date(`${a.date}T${a.time}`) >= new Date(),
              ) ? (
                (() => {
                  const next = myRota
                    .filter(
                      (a) =>
                        a.booked > 0 &&
                        new Date(`${a.date}T${a.time}`) >= new Date(),
                    )
                    .sort(
                      (a, b) =>
                        new Date(`${a.date}T${a.time}`).getTime() -
                        new Date(`${b.date}T${b.time}`).getTime(),
                    )[0];
                  return (
                    <div className="flex flex-col">
                      <p className="text-lg font-bold text-blue-600 truncate">
                        {next.participants?.[0]?.name}
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        {new Date(next.date).toLocaleDateString("en-US", {
                          weekday: "short",
                        })}{" "}
                        at {next.time}
                      </p>
                    </div>
                  );
                })()
              ) : (
                <p className="text-lg font-bold text-gray-400 italic">
                  No upcoming sessions
                </p>
              )}
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center ml-3">
              <User className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total Booked Appointments
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {bookedCount}
                </p>
                <p className="text-xs text-gray-400">
                  / {myRota.length} assigned slots
                </p>
              </div>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        {/* Calendar View */}
        {viewMode === "calendar" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">
                {currentMonthDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
              <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                <button
                  onClick={handlePrevMonth}
                  disabled={isPrevDisabled}
                  className={`p-1.5 rounded-l-lg transition-colors border-r border-gray-200 ${isPrevDisabled ? "text-gray-300 bg-gray-50 cursor-not-allowed" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentMonthDate(new Date("2026-03-01"))}
                  className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  Current
                </button>
                <button
                  onClick={handleNextMonth}
                  disabled={isNextDisabled}
                  className={`p-1.5 rounded-r-lg transition-colors border-l border-gray-200 ${isNextDisabled ? "text-gray-300 bg-gray-50 cursor-not-allowed" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 bg-gray-100 gap-px border-b border-gray-200">
              {Array.from({ length: padding }).map((_, i) => (
                <div key={`pad-${i}`} className="min-h-35 bg-gray-50/40" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const dayNum = i + 1;
                const dateStr = formatYYYYMMDD(dayNum);

                const today = new Date();
                const isToday =
                  year === today.getFullYear() &&
                  month === today.getMonth() &&
                  dayNum === today.getDate();

                const dayActivities = activities
                  .filter((a) => a.date === dateStr && a.type === "session")
                  .sort((a, b) => a.time.localeCompare(b.time));

                return (
                  <div
                    key={i}
                    className={`min-h-35 p-2 transition-colors ${
                      isToday
                        ? "bg-blue-50/60 ring-1 ring-inset ring-blue-200"
                        : "bg-white hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 pr-1">
                      {isToday ? (
                        <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
                          {dayNum}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-400 ml-auto">
                          {dayNum}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {dayActivities.map((slot) => {
                        const isMine = slot.facilitator === currentCounselor;
                        const isBooked = slot.booked > 0;

                        if (!isMine) {
                          return (
                            <div
                              key={slot.id}
                              className="p-1.5 rounded border bg-gray-100/50 border-gray-200 opacity-60"
                            >
                              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500">
                                <Lock className="w-3 h-3" /> {slot.time}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={slot.id}
                            className={`p-1.5 rounded border shadow-sm group relative ${
                              isBooked
                                ? "bg-green-50 border-green-200"
                                : "bg-white border-blue-200"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span
                                className={`text-[10px] font-black ${isBooked ? "text-green-700" : "text-blue-700"}`}
                              >
                                {slot.time}
                              </span>
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleOpenEditModal(slot)}
                                  className="p-0.5 rounded hover:bg-blue-100"
                                  title="Edit"
                                >
                                  <Edit2 className="w-2.5 h-2.5 text-blue-600" />
                                </button>
                                <button
                                  onClick={() => handleOpenCancelModal(slot)}
                                  className="p-0.5 rounded hover:bg-red-100"
                                  title="Cancel"
                                >
                                  <X className="w-2.5 h-2.5 text-red-600" />
                                </button>
                              </div>
                            </div>
                            <div
                              className={`text-[10px] truncate ${isBooked ? "text-green-600 font-semibold" : "text-blue-600"}`}
                            >
                              {isBooked
                                ? slot.participants?.[0]?.name
                                : "Available"}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === "list" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {myRota.map((slot) => {
                const isBooked = slot.booked > 0;
                return (
                  <div
                    key={slot.id}
                    className={`p-5 transition-colors ${isBooked ? "bg-green-50/30" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-25 border-r border-gray-200 pr-4">
                          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                            {new Date(slot.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {slot.time}
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2.5 py-0.5 text-xs font-medium rounded-md ${isBooked ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                            >
                              {isBooked ? "Booked" : "Available"}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {slot.category}
                          </p>
                        </div>
                      </div>
                      <div className="sm:text-right flex items-center gap-3">
                        {isBooked ? (
                          <div className="flex items-center sm:justify-end gap-2 text-sm text-gray-900">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium">
                              {slot.participants?.[0]?.name}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center sm:justify-end gap-1.5 text-sm text-gray-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Waiting for student</span>
                          </div>
                        )}
                        <div className="flex gap-1.5 border-l border-gray-200 pl-3">
                          <button
                            onClick={() => handleOpenEditModal(slot)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg bg-gray-50 hover:bg-blue-50 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenCancelModal(slot)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg bg-gray-50 hover:bg-red-50 transition-colors"
                            title="Cancel"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {modalMode === "edit" && selectedActivity && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Edit Session</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={editForm.time}
                  onChange={(e) =>
                    setEditForm({ ...editForm, time: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration
                </label>
                <input
                  type="text"
                  value={editForm.duration}
                  onChange={(e) =>
                    setEditForm({ ...editForm, duration: e.target.value })
                  }
                  placeholder="e.g., 50 min"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setModalMode(null);
                  setSelectedActivity(null);
                }}
                disabled={isSubmitting}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-blue-400"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {modalMode === "cancel" && selectedActivity && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Cancel Session?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to cancel this{" "}
                <span className="font-semibold text-gray-700">
                  {selectedActivity.title}
                </span>{" "}
                on{" "}
                <span className="font-semibold text-gray-700">
                  {selectedActivity.date}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setModalMode(null);
                    setSelectedActivity(null);
                  }}
                  disabled={isSubmitting}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Keep It
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isSubmitting}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-red-400"
                >
                  {isSubmitting ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
