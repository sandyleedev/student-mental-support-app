import {
  BarChart3,
  Calendar,
  Clock,
  Edit2,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

export type Activity = {
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
  location?: string;
};

type ModalMode = "create" | "edit" | null;

const MOCK_WORKSHOPS: Activity[] = [
  {
    id: "1",
    title: "Mindfulness & Meditation",
    type: "workshop",
    category: "Personal Wellbeing",
    date: "2026-03-12",
    time: "10:00",
    duration: "90 min",
    capacity: 20,
    booked: 18,
    status: "upcoming",
    facilitator: "Dr. James Chen",
    location: "Wellness Center Hall",
  },
  {
    id: "2",
    title: "Exam Stress Relief",
    type: "workshop",
    category: "Academic Support",
    date: "2026-03-15",
    time: "15:30",
    duration: "120 min",
    capacity: 25,
    booked: 25,
    status: "upcoming",
    facilitator: "Emily Gilmore",
    location: "Library Room A",
  },
  {
    id: "3",
    title: "Career Prep Group",
    type: "workshop",
    category: "Career Guidance",
    date: "2026-03-18",
    time: "13:00",
    duration: "90 min",
    capacity: 15,
    booked: 8,
    status: "upcoming",
    facilitator: "Dr. Sarah Mitchell",
    location: "Career Center",
  },
];

export function WellbeingDashboard() {
  const [workshops, setWorkshops] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "mine">("all");

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Activity | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = localStorage.getItem("user_name") || "Emily Gilmore";

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
        // TODO: GET /api/activities?type=workshop
        setWorkshops(MOCK_WORKSHOPS);
      } catch (error) {
        console.error("Error fetching workshops:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const filteredWorkshops = workshops.filter((workshop) => {
    const matchesSearch =
      workshop.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      workshop.facilitator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      (filterType === "mine" && workshop.facilitator === currentUser);
    return matchesSearch && matchesFilter;
  });

  const stats = {
    totalWorkshops: workshops.length,
    totalCapacity: workshops.reduce((sum, w) => sum + w.capacity, 0),
    totalBooked: workshops.reduce((sum, w) => sum + w.booked, 0),
  };

  const utilizationRate =
    stats.totalCapacity > 0
      ? Math.round((stats.totalBooked / stats.totalCapacity) * 100)
      : 0;

  const handleOpenModal = (
    mode: ModalMode,
    workshop: Activity | null = null,
  ) => {
    setSelectedWorkshop(workshop);
    setModalMode(mode);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedWorkshop(null);
  };

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const newWorkshopData: Partial<Activity> = {
      title: formData.get("title") as string,
      type: "workshop",
      category: formData.get("category") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      duration: formData.get("duration") as string,
      capacity: parseInt(formData.get("capacity") as string),
      facilitator: formData.get("facilitator") as string,
      location: formData.get("location") as string,
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      if (modalMode === "create") {
        const newActivity: Activity = {
          ...newWorkshopData,
          id: Math.random().toString(36).substr(2, 9),
          booked: 0,
          status: "upcoming",
        } as Activity;
        setWorkshops([newActivity, ...workshops]);
      } else if (modalMode === "edit" && selectedWorkshop) {
        setWorkshops(
          workshops.map((w) =>
            w.id === selectedWorkshop.id ? { ...w, ...newWorkshopData } : w,
          ),
        );
      }
      handleCloseModal();
    } catch (error) {
      console.error("Failed to save workshop:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkshop = async (id: string) => {
    if (confirm("Are you sure you want to delete this workshop?")) {
      try {
        setWorkshops(workshops.filter((w) => w.id !== id));
      } catch (error) {
        console.error("Failed to delete:", error);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <Calendar className="w-12 h-12 mb-4 animate-pulse text-teal-300" />
        <p>Loading workshops...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Team Workshops
            </h1>
            <p className="text-sm text-gray-500">
              Create and manage well-being group events.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal("create")}
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5" /> Create Workshop
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">
                Active Workshops
              </span>
              <Calendar className="w-5 h-5 text-teal-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalWorkshops}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">
                Total Students Reached
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
                Overall Fill Rate
              </span>
              <BarChart3 className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {utilizationRate}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search workshops by title or facilitator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${filterType === "all" ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-100"}`}
              >
                All Workshops
              </button>
              <button
                onClick={() => setFilterType("mine")}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${filterType === "mine" ? "bg-teal-50 text-teal-700" : "text-gray-600 hover:bg-gray-100"}`}
              >
                My Workshops
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredWorkshops.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-xl border border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No workshops found</p>
            </div>
          ) : (
            filteredWorkshops.map((workshop) => (
              <div
                key={workshop.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:border-teal-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="inline-block px-2.5 py-1 bg-teal-100 text-teal-800 text-xs font-bold rounded-md mb-2 uppercase tracking-wide">
                      {workshop.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900">
                      {workshop.title}
                    </h3>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleOpenModal("edit", workshop)}
                      className="p-1.5 text-gray-400 hover:text-green-600 rounded-md bg-gray-50 hover:bg-green-50"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteWorkshop(workshop.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-md bg-gray-50 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" /> {workshop.date}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> {workshop.time} (
                    {workshop.duration})
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {workshop.facilitator}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {workshop.location}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="text-gray-500">Registration</span>
                    <span
                      className={
                        workshop.booked >= workshop.capacity
                          ? "text-red-600"
                          : "text-teal-600"
                      }
                    >
                      {workshop.booked} / {workshop.capacity}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${workshop.booked >= workshop.capacity ? "bg-red-500" : "bg-teal-500"}`}
                      style={{
                        width: `${(workshop.booked / workshop.capacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === "create"
                  ? "Schedule New Workshop"
                  : "Edit Workshop"}
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
                    Workshop Title *
                  </label>
                  <input
                    required
                    name="title"
                    type="text"
                    defaultValue={selectedWorkshop?.title || ""}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Anxiety Management Group"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    defaultValue={
                      selectedWorkshop?.category || "Personal Wellbeing"
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 bg-white"
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
                    Max Capacity (Students) *
                  </label>
                  <input
                    required
                    name="capacity"
                    type="number"
                    min="2"
                    defaultValue={selectedWorkshop?.capacity || 10}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    required
                    name="date"
                    type="date"
                    defaultValue={selectedWorkshop?.date || ""}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
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
                    defaultValue={selectedWorkshop?.time || ""}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
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
                    defaultValue={selectedWorkshop?.duration || "90 min"}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location / Room *
                  </label>
                  <input
                    required
                    name="location"
                    type="text"
                    defaultValue={selectedWorkshop?.location || ""}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Wellness Center, Room A"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Facilitator *
                  </label>
                  <input
                    required
                    name="facilitator"
                    type="text"
                    defaultValue={selectedWorkshop?.facilitator || currentUser}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 mt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-teal-600 text-white py-2.5 rounded-lg hover:bg-teal-700 disabled:bg-teal-300 font-medium"
                >
                  {isSubmitting ? "Saving..." : "Save Workshop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
