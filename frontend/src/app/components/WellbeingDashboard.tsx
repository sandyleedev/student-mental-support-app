import {
  BarChart3,
  Calendar,
  Check,
  Clock,
  Edit2,
  Eye,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  Trash2,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type Participant = {
  id: string;
  name: string;
  email: string;
};

export type Workshop = {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  capacity: number;
  booked: number;
  status: "upcoming" | "ongoing" | "completed";
  facilitator: string;
  location: string;
  participants: Participant[];
};

type ModalMode = "create" | "edit" | "manage_students" | null;

// --- Mock Data ---
const MOCK_WORKSHOPS: Workshop[] = [
  {
    id: "1",
    title: "Mindfulness & Meditation",
    date: "2026-03-12",
    time: "10:00",
    duration: "90 min",
    capacity: 20,
    booked: 2,
    status: "upcoming",
    facilitator: "Dr. James Chen",
    location: "Wellness Center Hall",
    participants: [
      { id: "s1", name: "Rory Gilmore", email: "rory.g@yale.edu" },
      { id: "s2", name: "Lane Kim", email: "lane.k@music.com" },
    ],
  },
  {
    id: "2",
    title: "Exam Stress Relief",
    date: "2026-03-15",
    time: "15:30",
    duration: "120 min",
    capacity: 25,
    booked: 0,
    status: "upcoming",
    facilitator: "Emily Gilmore",
    location: "Library Room A",
    participants: [],
  },
  {
    id: "3",
    title: "Career Prep Group",
    date: "2026-03-18",
    time: "13:00",
    duration: "90 min",
    capacity: 15,
    booked: 1,
    status: "upcoming",
    facilitator: "Emily Gilmore",
    location: "Career Center",
    participants: [
      { id: "s3", name: "Paris Geller", email: "paris.g@yale.edu" },
    ],
  },
];

export function WellbeingDashboard() {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "mine">("all");

  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [manageTab, setManageTab] = useState<"enrolled" | "add">("enrolled");
  const [availableStudents, setAvailableStudents] = useState<Participant[]>([]);
  const [isFetchingStudents, setIsFetchingStudents] = useState(false);
  const [enrollingStudentId, setEnrollingStudentId] = useState<string | null>(
    null,
  );

  const currentUser = localStorage.getItem("user_name") || "Emily Gilmore";

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 600));
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
    workshop: Workshop | null = null,
  ) => {
    setSelectedWorkshop(workshop);
    setModalMode(mode);
    setManageTab("enrolled");
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setSelectedWorkshop(null);
    setManageTab("enrolled");
  };

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const newWorkshopData: Partial<Workshop> = {
      title: formData.get("title") as string,
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
        const newWorkshop: Workshop = {
          ...newWorkshopData,
          id: Math.random().toString(36).substr(2, 9),
          booked: 0,
          status: "upcoming",
          participants: [],
        } as Workshop;
        setWorkshops([newWorkshop, ...workshops]);
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
    if (
      confirm(
        "Are you sure you want to delete this workshop? This will cancel all student registrations.",
      )
    ) {
      setWorkshops(workshops.filter((w) => w.id !== id));
    }
  };

  // --- Student List Management ---
  const handleRemoveStudent = async (workshopId: string, studentId: string) => {
    if (!confirm("Remove this student from the workshop?")) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 400));

      setWorkshops((prevWorkshops) =>
        prevWorkshops.map((w) => {
          if (w.id === workshopId) {
            const updatedParticipants = w.participants.filter(
              (p) => p.id !== studentId,
            );
            return {
              ...w,
              participants: updatedParticipants,
              booked: updatedParticipants.length,
            };
          }
          return w;
        }),
      );

      if (selectedWorkshop && selectedWorkshop.id === workshopId) {
        const updatedParticipants = selectedWorkshop.participants.filter(
          (p) => p.id !== studentId,
        );
        setSelectedWorkshop({
          ...selectedWorkshop,
          participants: updatedParticipants,
          booked: updatedParticipants.length,
        });
      }
    } catch (error) {
      console.error("Failed to remove student:", error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchAvailableStudents = async (workshopId: string) => {
    setIsFetchingStudents(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));

      // TODO: API Placeholder
      // const response = await fetch(`/api/workshops/${workshopId}/available-students`);
      // const data = await response.json();

      // Mock data
      const mockAvailable: Participant[] = [
        { id: "s4", name: "Dean Forester", email: "dean@stars.com" },
        { id: "s5", name: "Jess Mariano", email: "jess@stars.com" },
        { id: "s6", name: "Logan Huntzberger", email: "logan@yale.edu" },
      ];

      const alreadyEnrolledIds =
        selectedWorkshop?.participants.map((p) => p.id) || [];
      setAvailableStudents(
        mockAvailable.filter((s) => !alreadyEnrolledIds.includes(s.id)),
      );
    } catch (error) {
      console.error("Failed to fetch available students:", error);
    } finally {
      setIsFetchingStudents(false);
    }
  };

  const handleEnrollStudent = async (
    workshopId: string,
    student: Participant,
  ) => {
    setEnrollingStudentId(student.id);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      // TODO: API Placeholder
      // await fetch(`/api/workshops/${workshopId}/enroll`, { method: 'POST', body: JSON.stringify({ studentId: student.id }) });

      setWorkshops((prev) =>
        prev.map((w) => {
          if (w.id === workshopId) {
            const updatedParticipants = [...w.participants, student];
            return {
              ...w,
              participants: updatedParticipants,
              booked: updatedParticipants.length,
            };
          }
          return w;
        }),
      );

      if (selectedWorkshop && selectedWorkshop.id === workshopId) {
        const updatedParticipants = [...selectedWorkshop.participants, student];
        setSelectedWorkshop({
          ...selectedWorkshop,
          participants: updatedParticipants,
          booked: updatedParticipants.length,
        });
      }

      setAvailableStudents((prev) => prev.filter((s) => s.id !== student.id));
    } catch (error) {
      console.error("Failed to enroll student:", error);
    } finally {
      setEnrollingStudentId(null);
    }
  };

  const handleTabChange = (tab: "enrolled" | "add") => {
    setManageTab(tab);
    if (tab === "add" && selectedWorkshop) {
      fetchAvailableStudents(selectedWorkshop.id);
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

  const isManagingOwnWorkshop = selectedWorkshop?.facilitator === currentUser;
  const isWorkshopFull = selectedWorkshop
    ? selectedWorkshop.booked >= selectedWorkshop.capacity
    : false;

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Team Workshops
            </h1>
            <p className="text-sm text-gray-500">
              Create events and manage student registrations.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal("create")}
            className="flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl transition-colors shadow-sm font-medium"
          >
            <Plus className="w-5 h-5" /> Create Workshop
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200">
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
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200">
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
          <div className="bg-white rounded-2xl shadow-sm p-5 border border-gray-200">
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

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search workshops by title or facilitator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === "all" ? "bg-white text-teal-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
              >
                All Staff
              </button>
              <button
                onClick={() => setFilterType("mine")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterType === "mine" ? "bg-white text-teal-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
              >
                My Workshops
              </button>
            </div>
          </div>
        </div>

        {/* Workshops Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredWorkshops.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No workshops found</p>
            </div>
          ) : (
            filteredWorkshops.map((workshop) => {
              const isMine = workshop.facilitator === currentUser;

              return (
                <div
                  key={workshop.id}
                  className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col transition-all ${isMine ? "border-gray-200 hover:border-teal-300" : "border-gray-100"}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {workshop.title}
                      </h3>
                      <span
                        className={`text-sm font-medium px-2 py-0.5 rounded-md ${isMine ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-gray-600"}`}
                      >
                        Host: {isMine ? "You" : workshop.facilitator}
                      </span>
                    </div>

                    {isMine && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenModal("edit", workshop)}
                          className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors"
                          title="Edit Info"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkshop(workshop.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg bg-gray-50 hover:bg-red-50 transition-colors"
                          title="Delete Workshop"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 text-sm text-gray-600 mb-6 flex-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />{" "}
                      {workshop.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />{" "}
                      {workshop.time} ({workshop.duration})
                    </div>
                    <div className="flex items-center gap-2 col-span-2">
                      <MapPin className="w-4 h-4 text-gray-400" />{" "}
                      {workshop.location}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 mt-auto">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-700 font-medium text-sm">
                          Registrations
                        </span>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${workshop.booked >= workshop.capacity ? "bg-red-100 text-red-700" : "bg-teal-100 text-teal-700"}`}
                        >
                          {workshop.booked} / {workshop.capacity}
                        </span>
                      </div>

                      <button
                        onClick={() =>
                          handleOpenModal("manage_students", workshop)
                        }
                        className={`text-xs font-bold bg-white border px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                          isMine
                            ? "text-teal-700 border-teal-200 hover:bg-teal-50"
                            : "text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {isMine ? (
                          <Users className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        {isMine ? "Manage List" : "View List"}
                      </button>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${workshop.booked >= workshop.capacity ? "bg-red-500" : "bg-teal-500"}`}
                        style={{
                          width: `${Math.min((workshop.booked / workshop.capacity) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* --- Modals --- */}

      {/* 1. Modal - Create/Edit Form */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === "create"
                  ? "Schedule New Workshop"
                  : "Edit Workshop Details"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-8 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Workshop Title *
                  </label>
                  <input
                    required
                    name="title"
                    type="text"
                    defaultValue={selectedWorkshop?.title || ""}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
                    placeholder="e.g., Anxiety Management Group"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Max Capacity (Students) *
                  </label>
                  <input
                    required
                    name="capacity"
                    type="number"
                    min="2"
                    defaultValue={selectedWorkshop?.capacity || 10}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Date *
                  </label>
                  <input
                    required
                    name="date"
                    type="date"
                    defaultValue={selectedWorkshop?.date || ""}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Time *
                  </label>
                  <input
                    required
                    name="time"
                    type="time"
                    defaultValue={selectedWorkshop?.time || ""}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Duration *
                  </label>
                  <input
                    required
                    name="duration"
                    type="text"
                    defaultValue={selectedWorkshop?.duration || "90 min"}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Location / Room *
                  </label>
                  <input
                    required
                    name="location"
                    type="text"
                    defaultValue={selectedWorkshop?.location || ""}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm"
                    placeholder="e.g., Wellness Center, Room A"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Lead Facilitator
                  </label>

                  <p className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm bg-gray-50">
                    {currentUser}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 pt-6 mt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 disabled:bg-teal-300 font-bold transition-colors"
                >
                  {isSubmitting ? "Saving..." : "Save Workshop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal - Manage Students List */}
      {modalMode === "manage_students" && selectedWorkshop && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Student Roster
                  </h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {selectedWorkshop.title}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 p-1 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {isManagingOwnWorkshop ? (
                <div className="flex bg-gray-100 p-1 rounded-xl">
                  <button
                    onClick={() => handleTabChange("enrolled")}
                    className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-colors ${manageTab === "enrolled" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    Enrolled ({selectedWorkshop.participants.length})
                  </button>
                  <button
                    onClick={() => handleTabChange("add")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-bold rounded-lg transition-colors ${manageTab === "add" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    <UserPlus className="w-4 h-4" /> Add Student
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Registered ({selectedWorkshop.participants.length})
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-medium">
                    View Only
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
              {/* Tab: Enrolled Students */}
              {manageTab === "enrolled" &&
                (selectedWorkshop.participants.length > 0 ? (
                  <div className="space-y-3">
                    {selectedWorkshop.participants.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-teal-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        {isManagingOwnWorkshop && (
                          <button
                            onClick={() =>
                              handleRemoveStudent(
                                selectedWorkshop.id,
                                student.id,
                              )
                            }
                            className="text-red-500 p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors"
                            title="Remove student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                    <ShieldAlert className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium text-sm">
                      No students registered yet.
                    </p>
                  </div>
                ))}

              {/* Tab: Add New Student */}
              {manageTab === "add" &&
                isManagingOwnWorkshop &&
                (isFetchingStudents ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-4"></div>
                    <p className="text-sm font-medium">
                      Finding available students...
                    </p>
                  </div>
                ) : availableStudents.length > 0 ? (
                  <div className="space-y-3">
                    {isWorkshopFull && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2 mb-4">
                        <ShieldAlert className="w-4 h-4" />
                        This workshop is at maximum capacity.
                      </div>
                    )}

                    {availableStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm">
                            {student.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {student.email}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() =>
                            handleEnrollStudent(selectedWorkshop.id, student)
                          }
                          disabled={
                            isWorkshopFull || enrollingStudentId === student.id
                          }
                          className="text-teal-700 bg-teal-50 hover:bg-teal-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed px-4 py-2 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          {enrollingStudentId === student.id ? (
                            <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}
                          Enroll
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                    <Check className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium text-sm">
                      No available students found for this time slot.
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
