import { AlertCircle, Calendar, CheckCircle, Clock, User } from "lucide-react";
import { useEffect, useState } from "react";

type ActivityType = "session" | "workshop";

type BookingActivity = {
  id: string;
  title: string;
  type: ActivityType;
  category: string;
  date: string;
  time: string;
  duration: string;
  capacity: number;
  booked: number;
  facilitator: string;
};

type BookingStatus =
  | "idle"
  | "submitting"
  | "success"
  | "fully-booked"
  | "error";

// --- Mock Data ---
const MOCK_ACTIVITIES: BookingActivity[] = [
  {
    id: "1",
    title: "Initial Assessment",
    type: "session",
    category: "Personal Wellbeing",
    date: "2026-03-12",
    time: "10:00",
    duration: "50 min",
    capacity: 1,
    booked: 0,
    facilitator: "Dr. Sarah Mitchell",
  },
  {
    id: "2",
    title: "Anxiety Management",
    type: "session",
    category: "Mental Health",
    date: "2026-03-12",
    time: "14:00",
    duration: "50 min",
    capacity: 1,
    booked: 1,
    facilitator: "Dr. James Chen",
  }, // Fully booked
  {
    id: "3",
    title: "Mindfulness Workshop",
    type: "workshop",
    category: "Personal Wellbeing",
    date: "2026-03-15",
    time: "15:30",
    duration: "90 min",
    capacity: 20,
    booked: 18,
    facilitator: "Dr. Sarah Mitchell",
  },
  {
    id: "4",
    title: "Career Stress Group",
    type: "workshop",
    category: "Career Guidance",
    date: "2026-03-18",
    time: "13:00",
    duration: "60 min",
    capacity: 15,
    booked: 15,
    facilitator: "Ms. Emily Rodriguez",
  }, // Fully booked
  {
    id: "5",
    title: "Academic Planning",
    type: "session",
    category: "Academic Support",
    date: "2026-03-20",
    time: "11:00",
    duration: "50 min",
    capacity: 1,
    booked: 0,
    facilitator: "Dr. James Chen",
  },
];

export function StudentBooking() {
  const [activeTab, setActiveTab] = useState<ActivityType>("session");
  const [activities, setActivities] = useState<BookingActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(
    null,
  );
  const [bookingStatus, setBookingStatus] = useState<BookingStatus>("idle");

  // --- 1. [API Placeholder] Fetch Available Activities ---
  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        // TODO: Replace with real GET request
        // const response = await fetch('http://localhost:5001/api/activities/available');
        // const data = await response.json();
        // setActivities(data);

        setActivities(MOCK_ACTIVITIES);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(
    (activity) => activity.type === activeTab,
  );
  const selectedActivity = activities.find((a) => a.id === selectedActivityId);

  // --- 2. [API Placeholder] Submit Booking Request ---
  const handleConfirmBooking = async () => {
    if (!selectedActivity) return;

    setBookingStatus("submitting");

    try {
      // Simulate network request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // TODO: Replace with real POST request containing user_id and activity_id
      /*
      const userId = localStorage.getItem('user_id');
      const response = await fetch('http://localhost:5001/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, activityId: selectedActivity.id })
      });

      if (response.status === 409) {
        // 409 Conflict: Capacity reached during transaction
        setBookingStatus('fully-booked');
        return;
      }
      if (!response.ok) throw new Error('Booking failed');
      */

      // Mock Logic: Check if someone else took the last slot while viewing
      if (selectedActivity.booked >= selectedActivity.capacity) {
        setBookingStatus("fully-booked");
      } else {
        // Mock Success: Update local state to reflect the booking
        setActivities((prev) =>
          prev.map((act) =>
            act.id === selectedActivity.id
              ? { ...act, booked: act.booked + 1 }
              : act,
          ),
        );
        setBookingStatus("success");
      }
    } catch (error) {
      console.error("Booking error:", error);
      setBookingStatus("error");
    }
  };

  const handleCloseModal = () => {
    setBookingStatus("idle");
    setSelectedActivityId(null);
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading available schedules...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Book an Appointment
          </h1>
          <p className="text-gray-600">
            Secure a spot for a 1-on-1 counseling session or join a well-being
            workshop.
          </p>
        </div>

        {/* Dual-Track Tabs */}
        <div className="flex bg-gray-200/50 p-1 rounded-xl mb-8">
          <button
            onClick={() => {
              setActiveTab("session");
              setSelectedActivityId(null);
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === "session"
                ? "bg-white text-blue-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            1-on-1 Counseling
          </button>
          <button
            onClick={() => {
              setActiveTab("workshop");
              setSelectedActivityId(null);
            }}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === "workshop"
                ? "bg-white text-teal-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Well-being Workshops
          </button>
        </div>

        <div className="space-y-4 mb-8">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">
                No schedules available right now.
              </p>
            </div>
          ) : (
            filteredActivities.map((activity) => {
              const isFull = activity.booked >= activity.capacity;
              const isSelected = selectedActivityId === activity.id;

              return (
                <div
                  key={activity.id}
                  onClick={() => !isFull && setSelectedActivityId(activity.id)}
                  className={`relative p-5 rounded-2xl border-2 transition-all ${
                    isFull
                      ? "bg-gray-50 border-gray-100 opacity-75 cursor-not-allowed"
                      : isSelected
                        ? "border-blue-500 bg-blue-50/50 cursor-pointer shadow-sm"
                        : "border-transparent bg-white hover:border-gray-200 cursor-pointer shadow-sm"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold uppercase tracking-wider ${activeTab === "session" ? "text-purple-600" : "text-teal-600"}`}
                        >
                          {activity.category}
                        </span>
                        {isFull && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-md">
                            Fully Booked
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {activity.title}
                      </h3>

                      <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(activity.date).toLocaleDateString("en-GB", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {activity.time} ({activity.duration})
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-gray-400" />
                          {activity.facilitator}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center sm:flex-col sm:items-end gap-2 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-4">
                      <div className="text-sm font-medium text-gray-900">
                        {activity.capacity - activity.booked}{" "}
                        <span className="text-gray-500 font-normal">
                          slots left
                        </span>
                      </div>
                      {!isFull && (
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-blue-600" : "border-gray-300"}`}
                        >
                          {isSelected && (
                            <div className="w-2.5 h-2.5 bg-blue-600 rounded-full" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="sticky bottom-6 bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center justify-between">
          <div>
            {selectedActivity ? (
              <p className="text-sm text-gray-900">
                Selected:{" "}
                <span className="font-bold">{selectedActivity.title}</span> on{" "}
                {selectedActivity.date}
              </p>
            ) : (
              <p className="text-sm text-gray-500">
                Please select an available slot.
              </p>
            )}
          </div>
          <button
            onClick={handleConfirmBooking}
            disabled={!selectedActivityId || bookingStatus === "submitting"}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl transition-colors text-sm font-medium shadow-sm"
          >
            {bookingStatus === "submitting"
              ? "Processing..."
              : "Confirm Booking"}
          </button>
        </div>

        {bookingStatus === "success" && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Booking Confirmed!
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                You are successfully booked for{" "}
                <span className="font-bold text-gray-900">
                  {selectedActivity?.title}
                </span>
                . A confirmation email has been sent.
              </p>
              <button
                onClick={handleCloseModal}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl transition-colors text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {bookingStatus === "fully-booked" && (
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Slot Unavailable
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                We're sorry, but the last spot for{" "}
                <span className="font-bold text-gray-900">
                  {selectedActivity?.title}
                </span>{" "}
                was just taken by another student.
              </p>
              <button
                onClick={handleCloseModal}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 rounded-xl transition-colors text-sm font-medium"
              >
                Choose Another Time
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
