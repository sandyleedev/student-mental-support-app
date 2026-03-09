import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

export type Booking = {
  id: string;
  title: string;
  type: "session" | "workshop";
  category: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  facilitator: string;
  status: "upcoming" | "completed" | "cancelled";
};

// --- Mock Data ---
const MOCK_BOOKINGS: Booking[] = [
  {
    id: "1",
    title: "Academic Support Session",
    type: "session",
    category: "Academic Support",
    date: "2026-03-16",
    time: "14:00",
    duration: "60 min",
    location: "Counseling Center, Room 203",
    facilitator: "Dr. Sarah Mitchell",
    status: "upcoming",
  },
  {
    id: "2",
    title: "Mindfulness & Meditation Workshop",
    type: "workshop",
    category: "Personal Wellbeing",
    date: "2026-03-18",
    time: "10:00",
    duration: "90 min",
    location: "Wellness Center, Main Hall",
    facilitator: "Dr. James Chen",
    status: "upcoming",
  },
  {
    id: "3",
    title: "Career Planning Session",
    type: "session",
    category: "Career Guidance",
    date: "2026-03-01",
    time: "09:00",
    duration: "45 min",
    location: "Counseling Center, Room 101",
    facilitator: "Ms. Emily Rodriguez",
    status: "completed",
  },
];

interface MyBookingsProps {
  onBookNew?: () => void; // Optional prop to navigate back to the booking page
}

export function MyBookings({ onBookNew }: MyBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal & Action States
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // --- 1. [API Placeholder] Fetch User's Bookings ---
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setIsLoading(true);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 600));

        // TODO: Replace with real GET request
        // const userId = localStorage.getItem('user_id');
        // const response = await fetch(`http://localhost:5001/api/users/${userId}/bookings`);
        // const data = await response.json();
        // setBookings(data);

        setBookings(MOCK_BOOKINGS);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // --- 2. [API Placeholder] Cancel Booking ---
  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setIsCancelling(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // TODO: Replace with real PUT/DELETE request
      /*
      const response = await fetch(`http://localhost:5001/api/bookings/${bookingToCancel.id}/cancel`, {
        method: 'PUT' // or DELETE depending on backend spec
      });
      if (!response.ok) throw new Error('Failed to cancel');
      */

      // Update local state: change status to 'cancelled'
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingToCancel.id ? { ...b, status: "cancelled" } : b,
        ),
      );

      setBookingToCancel(null);
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel the booking. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const upcomingBookings = bookings.filter((b) => b.status === "upcoming");
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled",
  );

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "upcoming":
        return (
          <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
            Upcoming
          </span>
        );
      case "completed":
        return (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
            Completed
          </span>
        );
      case "cancelled":
        return (
          <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-md">
            Cancelled
          </span>
        );
    }
  };

  const getTypeBadge = (type: "session" | "workshop") => {
    return type === "session" ? (
      <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md">
        1-on-1 Session
      </span>
    ) : (
      <span className="px-2.5 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded-md">
        Workshop
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">
            View and manage your upcoming counseling sessions and workshops.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Total Bookings
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {upcomingBookings.length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">
                Completed
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {bookings.filter((b) => b.status === "completed").length}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Upcoming Schedule
          </h2>
          {upcomingBookings.length > 0 ? (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-gray-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeBadge(booking.type)}
                        {getStatusBadge(booking.status)}
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {booking.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {booking.category}
                      </p>
                    </div>
                    <button
                      onClick={() => setBookingToCancel(booking)}
                      className="text-sm text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium self-start"
                    >
                      Cancel Booking
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">
                        {new Date(booking.date).toLocaleDateString("en-GB", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>
                        {booking.time} ({booking.duration})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span>{booking.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{booking.facilitator}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 border-dashed p-10 text-center">
              <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-1">
                No upcoming bookings
              </p>
              <p className="text-sm text-gray-400 mb-4">
                You don't have any scheduled sessions.
              </p>
              {onBookNew && (
                <button
                  onClick={onBookNew}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Book an Appointment
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">History</h2>
          {pastBookings.length > 0 ? (
            <div className="space-y-3">
              {pastBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-white rounded-xl border border-gray-100 p-4 opacity-75"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-900">
                          {booking.title}
                        </span>
                        {getStatusBadge(booking.status)}
                      </div>
                      <p className="text-xs text-gray-500">
                        {booking.category}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {booking.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {booking.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {booking.facilitator}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center opacity-75">
              <p className="text-sm text-gray-500">Your history is empty.</p>
            </div>
          )}
        </div>
      </div>

      {bookingToCancel && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Cancel Appointment?
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to cancel your{" "}
                <span className="font-semibold text-gray-700">
                  {bookingToCancel.title}
                </span>{" "}
                on{" "}
                <span className="font-semibold text-gray-700">
                  {bookingToCancel.date}
                </span>
                ? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setBookingToCancel(null)}
                  disabled={isCancelling}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  Keep It
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="flex-1 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-red-400"
                >
                  {isCancelling ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
