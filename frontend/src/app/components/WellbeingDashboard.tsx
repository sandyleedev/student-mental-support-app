/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
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
  facilitator_id?: number;
  location: string;
  participants: Participant[];
};

type ModalMode = "create" | "edit" | "manage_students" | null;

const API_BASE = "http://localhost:5001/api";

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

  const currentUser = localStorage.getItem("user_name") || "Staff Member";
  const currentUserId = parseInt(localStorage.getItem("user_id") || "1", 10);

  const fetchWorkshops = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        type: "workshop",
        filter: filterType,
        userId: currentUserId.toString(),
      });
      const response = await fetch(
        `${API_BASE}/activities?${params.toString()}`,
      );
      if (response.ok) {
        const data = await response.json();
        setWorkshops(
          Array.isArray(data.activities)
            ? data.activities
            : Array.isArray(data)
              ? data
              : [],
        );
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkshops();
  }, [filterType]);

  function isWorkshopActive(w: Workshop) {
    if (!w.date || !w.time) return false;
    const endDateTime = new Date(`${w.date}T${w.time}`);
    return endDateTime >= new Date() && w.status !== "completed";
  }

  const activeWorkshops = workshops.filter(isWorkshopActive);
  const historyWorkshops = workshops.filter((w) => !isWorkshopActive(w));

  const stats = {
    totalWorkshops: activeWorkshops.length,
    totalCapacity: activeWorkshops.reduce((sum, w) => sum + w.capacity, 0),
    totalBooked: activeWorkshops.reduce((sum, w) => sum + w.booked, 0),
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
  };

  const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    const payload = {
      title: formData.get("title") as string,
      date: formData.get("date") as string,
      time: formData.get("time") as string,
      duration: formData.get("duration") as string,
      capacity: parseInt(formData.get("capacity") as string, 10),
      location: formData.get("location") as string,
      facilitator_id: currentUserId,
      type: "WORKSHOP",
      start_time: `${formData.get("date")}T${formData.get("time")}:00.000Z`,
      end_time: `${formData.get("date")}T${formData.get("time")}:00.000Z`,
    };

    try {
      const url =
        modalMode === "create"
          ? `${API_BASE}/activities`
          : `${API_BASE}/activities/${selectedWorkshop?.id}`;
      const method = modalMode === "create" ? "POST" : "PUT";
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchWorkshops();
        handleCloseModal();
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWorkshop = async (id: string) => {
    if (confirm("Permanently delete this activity?")) {
      try {
        const response = await fetch(`${API_BASE}/activities/${id}`, {
          method: "DELETE",
        });
        if (response.ok) fetchWorkshops();
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleRemoveStudent = async (workshopId: string, studentId: string) => {
    if (!confirm("Remove student from participants?")) return;
    try {
      const response = await fetch(
        `${API_BASE}/activities/${workshopId}/bookings/${studentId}/cancel`,
        { method: "PUT" },
      );
      if (response.ok) {
        fetchWorkshops();
        if (selectedWorkshop) {
          const updated = selectedWorkshop.participants.filter(
            (p) => String(p.id) !== String(studentId),
          );
          setSelectedWorkshop({
            ...selectedWorkshop,
            participants: updated,
            booked: updated.length,
          });
        }
      }
    } catch (error) {
      console.error("Remove error:", error);
    }
  };

  const fetchAvailableStudents = async () => {
    setIsFetchingStudents(true);
    try {
      const response = await fetch(`${API_BASE}/users?role=student`);
      if (response.ok) {
        const data = await response.json();
        const studentList = Array.isArray(data) ? data : data.users || [];
        const enrolledIds =
          selectedWorkshop?.participants?.map((p) => String(p.id)) || [];

        const filteredStudents = studentList.filter(
          (s: any) => !enrolledIds.includes(String(s.id)),
        );

        const formattedStudents = filteredStudents.map((s: any) => ({
          id: String(s.id),
          name:
            s.name ||
            `${s.first_name || ""} ${s.last_name || ""}`.trim() ||
            "Unknown User",
          email: s.email || "",
        }));

        setAvailableStudents(formattedStudents);
      }
    } catch (error) {
      console.error("Available users fetch error:", error);
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
      const response = await fetch(
        `${API_BASE}/activities/${workshopId}/bookings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ student_id: parseInt(student.id, 10) }),
        },
      );
      if (response.ok) {
        fetchWorkshops();
        if (selectedWorkshop) {
          const currentParticipants = selectedWorkshop.participants || [];
          const updated = [...currentParticipants, student];
          setSelectedWorkshop({
            ...selectedWorkshop,
            participants: updated,
            booked: updated.length,
          });
        }
        setAvailableStudents((prev) => prev.filter((s) => s.id !== student.id));
      }
    } catch (error) {
      console.error("Enroll error:", error);
    } finally {
      setEnrollingStudentId(null);
    }
  };

  const handleTabChange = (tab: "enrolled" | "add") => {
    setManageTab(tab);
    if (tab === "add") fetchAvailableStudents();
  };

  if (isLoading) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
        <Calendar className="w-12 h-12 mb-4 animate-pulse text-teal-300" />
        <p>Loading workshops...</p>
      </div>
    );
  }

  const isWorkshopFull = selectedWorkshop
    ? (selectedWorkshop.booked || 0) >= (selectedWorkshop.capacity || 0)
    : false;
  const isManagingOwnWorkshop = selectedWorkshop
    ? selectedWorkshop.facilitator_id === currentUserId
    : false;

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Team Workshops
            </h1>
            <p className="text-sm text-gray-500">
              Manage activities and student registrations.
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
                Total Bookings
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
                Utilization Rate
              </span>
              <BarChart3 className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {utilizationRate}%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 text-sm outline-none"
              />
            </div>
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === "all" ? "bg-white text-teal-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
              >
                All Activities
              </button>
              <button
                onClick={() => setFilterType("mine")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === "mine" ? "bg-white text-teal-700 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
              >
                My Hosted
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-12">
          {activeWorkshops.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">No active workshops</p>
            </div>
          ) : (
            activeWorkshops.map((workshop) => {
              const isMine = workshop.facilitator_id === currentUserId;
              return (
                <div
                  key={workshop.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col hover:border-teal-300 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {workshop.title}
                      </h3>
                      <span className="text-sm font-medium px-2 py-0.5 rounded-md bg-teal-50 text-teal-700">
                        Host: {isMine ? "You" : workshop.facilitator}
                      </span>
                    </div>
                    {isMine && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenModal("edit", workshop)}
                          className="p-1.5 text-gray-400 hover:text-green-600 rounded-lg bg-gray-50 hover:bg-green-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteWorkshop(workshop.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg bg-gray-50 hover:bg-red-50 transition-colors"
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
                        className="text-xs font-bold bg-white border border-teal-200 text-teal-700 px-3 py-1.5 rounded-lg hover:bg-teal-50 transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        {isMine ? (
                          <Users className="w-3.5 h-3.5" />
                        ) : (
                          <Eye className="w-3.5 h-3.5" />
                        )}
                        {isMine ? "Manage" : "View"}
                      </button>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${workshop.booked >= workshop.capacity ? "bg-red-500" : "bg-teal-500"}`}
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

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">History</h2>
          {historyWorkshops.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center opacity-75">
              <p className="text-sm text-gray-500">No history.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {historyWorkshops.map((workshop) => (
                <div
                  key={workshop.id}
                  className="bg-white rounded-2xl border border-gray-100 p-6 opacity-75"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {workshop.title}
                      </h3>
                      <span className="text-sm font-medium px-2 py-0.5 rounded-md bg-gray-50 text-gray-500">
                        Host: {workshop.facilitator}
                      </span>
                    </div>
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
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                          {workshop.booked} / {workshop.capacity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(modalMode === "create" || modalMode === "edit") && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto scale-in duration-200">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between z-10">
              <h3 className="text-xl font-bold text-gray-900">
                {modalMode === "create"
                  ? "Schedule New Workshop"
                  : "Edit Workshop"}
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
                    Title
                  </label>
                  <input
                    required
                    name="title"
                    type="text"
                    defaultValue={selectedWorkshop?.title || ""}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Capacity
                  </label>
                  <input
                    required
                    name="capacity"
                    type="number"
                    min="1"
                    defaultValue={selectedWorkshop?.capacity || 10}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Date
                  </label>
                  <input
                    required
                    name="date"
                    type="date"
                    defaultValue={selectedWorkshop?.date || ""}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Time
                  </label>
                  <input
                    required
                    name="time"
                    type="time"
                    defaultValue={selectedWorkshop?.time || ""}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Duration (e.g. 90 min)
                  </label>
                  <input
                    required
                    name="duration"
                    type="text"
                    defaultValue={selectedWorkshop?.duration || "60 min"}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Location
                  </label>
                  <input
                    required
                    name="location"
                    type="text"
                    defaultValue={selectedWorkshop?.location || ""}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Facilitator
                  </label>
                  <p className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-sm font-medium text-gray-600">
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
                  className="flex-1 bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 disabled:bg-teal-300 font-bold transition-colors shadow-lg shadow-teal-100"
                >
                  {isSubmitting ? "Processing..." : "Save Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalMode === "manage_students" && selectedWorkshop && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] scale-in duration-200">
            <div className="bg-white border-b border-gray-200 px-6 py-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    Participants
                  </h3>
                  <p className="text-sm text-gray-500 font-medium truncate max-w-62.5">
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
                    className={`flex-1 py-1.5 text-sm font-bold rounded-lg transition-all ${manageTab === "enrolled" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    Enrolled ({selectedWorkshop.participants?.length || 0})
                  </button>
                  <button
                    onClick={() => handleTabChange("add")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-sm font-bold rounded-lg transition-all ${manageTab === "add" ? "bg-white text-teal-700 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
                  >
                    <UserPlus className="w-4 h-4" /> Add
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Registered ({selectedWorkshop.participants?.length || 0})
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md font-medium">
                    View Only
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 overflow-y-auto bg-gray-50/50">
              {manageTab === "enrolled" &&
                (selectedWorkshop.participants &&
                selectedWorkshop.participants.length > 0 ? (
                  <div className="space-y-3">
                    {selectedWorkshop.participants.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-teal-300 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-full flex items-center justify-center font-bold text-sm uppercase">
                            {student.name.charAt(0)}
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
                            className="text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors"
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
                      No registrations yet.
                    </p>
                  </div>
                ))}
              {manageTab === "add" &&
                isManagingOwnWorkshop &&
                (isFetchingStudents ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mb-4" />
                    <p className="text-sm font-medium">Fetching students...</p>
                  </div>
                ) : availableStudents.length > 0 ? (
                  <div className="space-y-3">
                    {isWorkshopFull && (
                      <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-sm font-medium flex items-center gap-2 mb-4">
                        <ShieldAlert className="w-4 h-4" /> Workshop capacity
                        reached.
                      </div>
                    )}
                    {availableStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm uppercase">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">
                              {student.name}
                            </p>
                            <p className="text-xs text-gray-500 font-medium">
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
                          className="text-teal-700 bg-teal-50 hover:bg-teal-100 disabled:bg-gray-100 disabled:text-gray-400 px-4 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                        >
                          {enrollingStudentId === student.id ? (
                            <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Plus className="w-3.5 h-3.5" />
                          )}{" "}
                          Enroll
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-white">
                    <Check className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium text-sm">
                      No eligible students available.
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
