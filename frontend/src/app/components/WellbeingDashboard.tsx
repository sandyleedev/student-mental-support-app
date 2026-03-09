import {
  BarChart3,
  Calendar,
  Clock,
  Edit2,
  Eye,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export type ActivityType = "session" | "workshop";

export type Activity = {
  id: string;
  title: string;
  type: ActivityType;
  category: string;
  date: string;
  time: string;
  duration: string;
  capacity: number;
  booked: number;
  status: "upcoming" | "ongoing" | "completed";
  facilitator: string;
};

type ModalMode = "create" | "edit" | "view" | null;

// --- Mock Data ---
const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "1",
    title: "Academic Support Session",
    type: "session",
    category: "Academic Support",
    date: "2026-03-10",
    time: "14:00",
    duration: "60 min",
    capacity: 5,
    booked: 3,
    status: "upcoming",
    facilitator: "Dr. Sarah Mitchell",
  },
  {
    id: "2",
    title: "Mindfulness & Meditation Workshop",
    type: "workshop",
    category: "Personal Wellbeing",
    date: "2026-03-12",
    time: "10:00",
    duration: "90 min",
    capacity: 20,
    booked: 18,
    status: "upcoming",
    facilitator: "Dr. James Chen",
  },
  {
    id: "3",
    title: "Career Planning Session",
    type: "session",
    category: "Career Guidance",
    date: "2026-03-08",
    time: "09:00",
    duration: "45 min",
    capacity: 3,
    booked: 3,
    status: "completed",
    facilitator: "Ms. Emily Rodriguez",
  },
];

export function WellbeingDashboard() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | ActivityType>("all");

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string>("");
  const [facilitatorValue, setFacilitatorValue] = useState<string>("");

  // 1. [API] GET /api/activities
  useEffect(() => {
    const name = localStorage.getItem("user_name") || "";
    setCurrentUserName(name);
    const fetchActivities = async () => {
      try {
        setIsLoadingData(true);
        await new Promise((resolve) => setTimeout(resolve, 600));

        // After API is ready, replace the below line with actual fetch:
        // const response = await fetch('http://localhost:5001/api/activities');
        // const data = await response.json();
        // setActivities(data);

        setActivities(INITIAL_ACTIVITIES);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchActivities();
  }, []);

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.facilitator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || activity.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalActivities: activities.length,
    upcomingActivities: activities.filter((a) => a.status === "upcoming")
      .length,
    totalBooked: activities.reduce((sum, a) => sum + a.booked, 0),
    totalCapacity: activities.reduce((sum, a) => sum + a.capacity, 0),
  };

  const utilizationRate =
    stats.totalCapacity > 0
      ? Math.round((stats.totalBooked / stats.totalCapacity) * 100)
      : 0;

  const handleOpenModal = (
    mode: ModalMode,
    activity: Activity | null = null,
  ) => {
    setSelectedActivity(activity);
    setModalMode(mode);
    if (mode === "create") {
      setFacilitatorValue(localStorage.getItem("user_name") || "");
    } else {
      setFacilitatorValue(activity?.facilitator || "");
    }
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedActivity(null);
    setFacilitatorValue("");
  };

  // 2. [API] POST /api/activities or PUT /api/activities/:id
  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const newActivityData: Partial<Activity> = {
      title: formData.get("title") as string,
      type: formData.get("type") as ActivityType,
      category: formData.get("category") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      duration: formData.get("duration") as string,
      capacity: parseInt(formData.get("capacity") as string),
      facilitator: formData.get("facilitator") as string,
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (modalMode === "create") {
        // Mock Create
        const newActivity: Activity = {
          ...newActivityData,
          id: Math.random().toString(36).substr(2, 9),
          booked: 0,
          status: "upcoming",
        } as Activity;
        setActivities([newActivity, ...activities]);
      } else if (modalMode === "edit" && selectedActivity) {
        // Mock Update
        setActivities(
          activities.map((a) =>
            a.id === selectedActivity.id ? { ...a, ...newActivityData } : a,
          ),
        );
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save activity:", error);
      alert("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. [API] DELETE /api/activities/:id
  const handleDeleteActivity = async (activityId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this activity? This cannot be undone.",
      )
    ) {
      try {
        // API
        // await fetch(`http://localhost:5001/api/activities/${activityId}`, { method: 'DELETE' });
        setActivities(activities.filter((a) => a.id !== activityId));
      } catch (error) {
        console.error("Failed to delete activity:", error);
      }
    }
  };

  const getStatusColor = (status: Activity["status"]) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-100 text-blue-700 border border-blue-200";
      case "ongoing":
        return "bg-green-100 text-green-700 border border-green-200";
      case "completed":
        return "bg-gray-100 text-gray-700 border border-gray-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeColor = (type: ActivityType) => {
    return type === "session"
      ? "bg-purple-100 text-purple-700"
      : "bg-teal-100 text-teal-700";
  };

  if (isLoadingData) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <Calendar className="w-12 h-12 mb-4 animate-pulse text-blue-300" />
        <p>Loading team dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Well-being Team Dashboard
              </h1>
              <p className="text-sm text-gray-500">
                {currentUserName ? `Welcome, ${currentUserName}. ` : ""}Manage
                counseling sessions and wellness workshops
              </p>
            </div>
            <button
              onClick={() => handleOpenModal("create")}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm font-medium"
            >
              <Plus className="w-5 h-5" />
              <span>Create Activity</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Total Activities
                </span>
                <Calendar className="w-5 h-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalActivities}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Upcoming
                </span>
                <Clock className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.upcomingActivities}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Total Bookings
                </span>
                <Users className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalBooked}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  Utilization
                </span>
                <BarChart3 className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {utilizationRate}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title, category, or facilitator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "all"
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterType("session")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "session"
                    ? "bg-purple-50 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                1-on-1 Sessions
              </button>
              <button
                onClick={() => setFilterType("workshop")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterType === "workshop"
                    ? "bg-teal-50 text-teal-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Workshops
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredActivities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 mb-1">
                        {activity.title}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {activity.facilitator}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(activity.type)}`}
                      >
                        {activity.type === "session" ? "Session" : "Workshop"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(activity.date).toLocaleDateString("en-GB")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {activity.time} • {activity.duration}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[60px]">
                          <div
                            className={`h-1.5 rounded-full ${activity.booked === activity.capacity ? "bg-red-500" : "bg-blue-500"}`}
                            style={{
                              width: `${(activity.booked / activity.capacity) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 font-medium">
                          {activity.booked}/{activity.capacity}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}
                      >
                        {activity.status.charAt(0).toUpperCase() +
                          activity.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenModal("view", activity)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenModal("edit", activity)}
                          className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg transition-colors"
                          title="Edit activity"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteActivity(activity.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-16">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No activities found</p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filters.
              </p>
            </div>
          )}
        </div>
      </div>

      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === "create"
                  ? "Create New Activity"
                  : "Edit Activity"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Title *
                  </label>
                  <input
                    required
                    name="title"
                    type="text"
                    defaultValue={selectedActivity?.title || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="e.g., Exam Prep Workshop"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    name="type"
                    defaultValue={selectedActivity?.type || "session"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  >
                    <option value="session">1-on-1 Session</option>
                    <option value="workshop">Well-being Workshop</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    defaultValue={
                      selectedActivity?.category || "Academic Support"
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                  >
                    <option value="Academic Support">Academic Support</option>
                    <option value="Personal Wellbeing">
                      Personal Wellbeing
                    </option>
                    <option value="Career Guidance">Career Guidance</option>
                    <option value="Social Connection">Social Connection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    required
                    name="date"
                    type="date"
                    defaultValue={selectedActivity?.date || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time *
                  </label>
                  <input
                    required
                    name="time"
                    type="time"
                    defaultValue={selectedActivity?.time || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration *
                  </label>
                  <input
                    required
                    name="duration"
                    type="text"
                    defaultValue={selectedActivity?.duration || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="e.g., 60 min"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity *
                  </label>
                  <input
                    required
                    name="capacity"
                    type="number"
                    min="1"
                    defaultValue={selectedActivity?.capacity || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="e.g., 10"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facilitator *
                  </label>
                  <input
                    required
                    name="facilitator"
                    type="text"
                    value={facilitatorValue}
                    onChange={(e) => setFacilitatorValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="e.g., Dr. Sarah Mitchell"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors text-sm font-medium"
                >
                  {isSubmitting
                    ? "Saving..."
                    : modalMode === "create"
                      ? "Create Activity"
                      : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMode === "view" && selectedActivity && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedActivity.title}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    Category
                  </div>
                  <div className="text-sm text-gray-900">
                    {selectedActivity.category}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    Facilitator
                  </div>
                  <div className="text-sm text-gray-900">
                    {selectedActivity.facilitator}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    Date & Time
                  </div>
                  <div className="text-sm text-gray-900">
                    {selectedActivity.date} at {selectedActivity.time}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    Duration
                  </div>
                  <div className="text-sm text-gray-900">
                    {selectedActivity.duration}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    Booking Progress
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {selectedActivity.booked} / {selectedActivity.capacity}{" "}
                    Filled
                  </div>
                </div>
                <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all ${selectedActivity.booked === selectedActivity.capacity ? "bg-red-500" : "bg-blue-500"}`}
                    style={{
                      width: `${(selectedActivity.booked / selectedActivity.capacity) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-2.5 rounded-lg transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
