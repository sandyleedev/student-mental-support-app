import {
  AlertCircle,
  CalendarDays,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  List,
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

// mock data for fixed rota - in real app, this would come from backend API
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
];

export function TeamRota() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar");

  const [currentDate, setCurrentDate] = useState(new Date("2026-03-09"));

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

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);

  const weekDays = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(d.getDate() + i);
    return d;
  });

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const formatYYYYMMDD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const getActivitiesForDate = (dateObj: Date) => {
    const targetDateStr = formatYYYYMMDD(dateObj);
    return myRota
      .filter((slot) => slot.date === targetDateStr)
      .sort((a, b) => a.time.localeCompare(b.time));
  };

  const currentMonthYear = startOfWeek.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

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
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            My Personal Schedule
          </h1>
          <p className="text-gray-600">
            View your assigned 1-on-1 counseling slots and check upcoming
            student appointments.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500 mb-1">
                Next Appointment
              </p>
              {myRota.find(
                (a) =>
                  a.booked > 0 && new Date(`${a.date} ${a.time}`) >= new Date(),
              ) ? (
                (() => {
                  const next = myRota
                    .filter(
                      (a) =>
                        a.booked > 0 &&
                        new Date(`${a.date} ${a.time}`) >= new Date(),
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
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Booked Appointments
              </p>
              <p className="text-2xl font-bold text-gray-900">{bookedCount}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="flex w-full m-5">
          <div className="relative flex p-1 bg-gray-100/80 rounded-full border border-gray-200/60 w-60 shadow-inner">
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

        {viewMode === "calendar" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-gray-900 w-36">
                  {currentMonthYear}
                </h2>
                <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <button
                    onClick={handlePrevWeek}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-l-lg transition-colors border-r border-gray-200"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleToday}
                    className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNextWeek}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-r-lg transition-colors border-l border-gray-200"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-gray-200">
              {weekDays.map((dayDate, index) => {
                const dayName = dayDate.toLocaleDateString("en-US", {
                  weekday: "short",
                });
                const dayNum = dayDate.getDate();
                const activitiesForDay = getActivitiesForDate(dayDate);
                const isToday =
                  formatYYYYMMDD(dayDate) === formatYYYYMMDD(new Date());

                return (
                  <div key={index} className="min-h-100 bg-gray-50/20">
                    <div
                      className={`p-3 border-b border-gray-200 flex flex-col items-center justify-center gap-1 ${isToday ? "bg-blue-50/50" : "bg-gray-50/80"}`}
                    >
                      <span
                        className={`text-xs font-bold uppercase tracking-wider ${isToday ? "text-blue-600" : "text-gray-500"}`}
                      >
                        {dayName}
                      </span>
                      <span
                        className={`text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full ${isToday ? "bg-blue-600 text-white shadow-md" : "text-gray-900"}`}
                      >
                        {dayNum}
                      </span>
                    </div>

                    <div className="p-3 space-y-3">
                      {activitiesForDay.length === 0 ? (
                        <div className="text-center py-8 text-sm text-gray-400">
                          No shifts
                        </div>
                      ) : (
                        activitiesForDay.map((slot) => {
                          const isBooked = slot.booked > 0;
                          return (
                            <div
                              key={slot.id}
                              className={`p-3 rounded-xl border ${isBooked ? "bg-green-50 border-green-200" : "bg-white border-gray-200 shadow-sm"}`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-gray-900">
                                  {slot.time}
                                </span>
                                {isBooked ? (
                                  <span
                                    className="w-2 h-2 rounded-full bg-green-500"
                                    title="Booked"
                                  ></span>
                                ) : (
                                  <span
                                    className="w-2 h-2 rounded-full bg-gray-400"
                                    title="Available"
                                  ></span>
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mb-2 leading-tight">
                                {slot.category}
                              </p>
                              {isBooked ? (
                                <div className="flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-md overflow-hidden">
                                  <User className="w-3 h-3 shrink-0" />
                                  <span className="truncate">
                                    {slot.studentName}
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 text-xs text-gray-400 px-2 py-1">
                                  <AlertCircle className="w-3 h-3" /> Available
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
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
