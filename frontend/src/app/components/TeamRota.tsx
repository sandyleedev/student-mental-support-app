import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  List,
  Lock,
  User,
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
  studentName?: string;
};

const FIXED_ROTA: Activity[] = [
  {
    id: "1",
    title: "1-on-1 Counseling",
    type: "session",
    category: "Personal Wellbeing",
    date: "2026-03-09",
    time: "10:00",
    duration: "50 min",
    capacity: 1,
    booked: 1,
    status: "upcoming",
    facilitator: "Emily Gilmore",
    studentName: "Rory Gilmore",
  },
  {
    id: "2",
    title: "1-on-1 Counseling",
    type: "session",
    category: "Academic Support",
    date: "2026-03-10",
    time: "14:00",
    duration: "50 min",
    capacity: 1,
    booked: 0,
    status: "upcoming",
    facilitator: "Emily Gilmore",
  },
  {
    id: "3",
    title: "1-on-1 Counseling",
    type: "session",
    category: "Career Guidance",
    date: "2026-03-11",
    time: "09:00",
    duration: "50 min",
    capacity: 1,
    booked: 1,
    status: "upcoming",
    facilitator: "Emily Gilmore",
    studentName: "Lane Kim",
  },
  {
    id: "4",
    title: "1-on-1 Counseling",
    type: "session",
    category: "Personal Wellbeing",
    date: "2026-03-12",
    time: "11:00",
    duration: "50 min",
    capacity: 1,
    booked: 0,
    status: "upcoming",
    facilitator: "Emily Gilmore",
  },
  {
    id: "5",
    title: "1-on-1 Counseling",
    type: "session",
    category: "Academic Support",
    date: "2026-03-13",
    time: "15:00",
    duration: "50 min",
    capacity: 1,
    booked: 1,
    status: "upcoming",
    facilitator: "Emily Gilmore",
    studentName: "Paris Geller",
  },
  {
    id: "6",
    title: "1-on-1 Counseling",
    type: "session",
    category: "Personal Wellbeing",
    date: "2026-03-12",
    time: "14:00",
    duration: "50 min",
    capacity: 1,
    booked: 0,
    status: "upcoming",
    facilitator: "Sookie St. James",
  },
];

export function TeamRota() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");

  const [currentMonthDate, setCurrentMonthDate] = useState(
    new Date("2026-03-01"),
  );
  const baseMonthDate = new Date("2026-03-01");

  const currentCounselor = localStorage.getItem("user_name") || "Emily Gilmore";

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        setActivities(FIXED_ROTA);
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 w-full">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Next Appointment
              </p>
              {myRota.find(
                (a) =>
                  a.booked > 0 &&
                  new Date(`${a.date} ${a.time}`) >= new Date("2026-03-01"),
              ) ? (
                (() => {
                  const next = myRota
                    .filter(
                      (a) =>
                        a.booked > 0 &&
                        new Date(`${a.date} ${a.time}`) >=
                          new Date("2026-03-01"),
                    )
                    .sort(
                      (a, b) =>
                        new Date(`${a.date} ${a.time}`).getTime() -
                        new Date(`${b.date} ${b.time}`).getTime(),
                    )[0];
                  return (
                    <div className="flex flex-col">
                      <p className="text-lg font-bold text-blue-600 truncate">
                        {next.studentName}
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
                  / {myRota.length} fixed slots
                </p>
              </div>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

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
                            className={`p-1.5 rounded border shadow-sm ${
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
                            </div>
                            <div
                              className={`text-[10px] truncate ${isBooked ? "text-green-600 font-semibold" : "text-blue-600"}`}
                            >
                              {isBooked ? slot.studentName : "Available"}
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
                      <div className="sm:text-right">
                        {isBooked ? (
                          <div className="flex items-center sm:justify-end gap-2 text-sm text-gray-900">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <span className="font-medium">
                              {slot.studentName}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center sm:justify-end gap-1.5 text-sm text-gray-400">
                            <AlertCircle className="w-4 h-4" />
                            <span>Waiting for student</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
