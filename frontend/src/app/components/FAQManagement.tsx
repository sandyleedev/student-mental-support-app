import {
  AlertCircle,
  BookOpen,
  Edit2,
  Heart,
  Plus,
  Save,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  preview: string;
  fullAnswer: string;
  category: string;
  tags: string[];
  createdDate: string;
  lastModified: string;
}

// Mock data - TODO: Replace with API call to fetch FAQs
const MOCK_FAQ_DATA: FAQItem[] = [
  {
    id: "1",
    question: "How to apply for an extension?",
    preview:
      "Learn about the eligibility criteria and the process for requesting a coursework extension...",
    fullAnswer:
      "To apply for an extension, you need to: 1) Log into the student portal, 2) Navigate to the Extensions section, 3) Fill out the extension request form with your reason and supporting documentation, 4) Submit the form at least 3 days before the deadline. Extensions are typically granted for medical reasons, family emergencies, or exceptional circumstances.",
    category: "Academic Stress",
    tags: ["extension", "deadline", "coursework", "academic"],
    createdDate: "2024-01-15",
    lastModified: "2024-02-10",
  },
  {
    id: "2",
    question: "Managing test anxiety tips",
    preview:
      "Explore effective strategies to stay calm and focused before and during your exams...",
    fullAnswer:
      "Test anxiety is common and manageable. Try these strategies: 1) Practice deep breathing exercises before the exam, 2) Arrive early to settle in, 3) Read through all questions first, 4) Start with questions you know, 5) Take short breaks if allowed, 6) Maintain a positive mindset. Our counseling center also offers test anxiety workshops.",
    category: "Mental Health",
    tags: ["anxiety", "test", "exam", "stress", "mental health"],
    createdDate: "2024-01-20",
    lastModified: "2024-02-12",
  },
  {
    id: "3",
    question: "Where is the student counseling center?",
    preview:
      "Find location details, opening hours, and contact information for the campus center...",
    fullAnswer:
      "The Student Counseling Center is located in Building A, Room 203. We are open Monday-Friday, 9:00 AM - 5:00 PM. For urgent matters after hours, please call our 24/7 crisis hotline at 0800-123-4567. You can also book appointments online through the CampusCompass platform.",
    category: "Campus Resources",
    tags: ["counseling", "location", "center", "campus"],
    createdDate: "2024-01-10",
    lastModified: "2024-01-10",
  },
];

// TODO: Create API service functions
// Example:
// async function fetchFAQs(): Promise<FAQItem[]> {
//   const response = await fetch('/api/faqs');
//   return response.json();
// }
//
// async function createFAQ(faq: Omit<FAQItem, 'id' | 'createdDate' | 'lastModified'>): Promise<FAQItem> {
//   const response = await fetch('/api/faqs', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(faq),
//   });
//   return response.json();
// }
//
// async function updateFAQ(id: string, faq: Partial<FAQItem>): Promise<FAQItem> {
//   const response = await fetch(`/api/faqs/${id}`, {
//     method: 'PUT',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(faq),
//   });
//   return response.json();
// }
//
// async function deleteFAQ(id: string): Promise<void> {
//   await fetch(`/api/faqs/${id}`, { method: 'DELETE' });
// }

export function FAQManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [faqList, setFaqList] = useState<FAQItem[]>(MOCK_FAQ_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace with actual API call
  useEffect(() => {
    const loadFAQs = async () => {
      setIsLoading(true);
      try {
        // TODO: Uncomment when API is ready
        // const data = await fetchFAQs();
        // setFaqList(data);

        // Using mock data for now
        setFaqList(MOCK_FAQ_DATA);
      } catch (error) {
        console.error("Failed to load FAQs:", error);
        setFaqList(MOCK_FAQ_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    loadFAQs();
  }, []);

  const [formData, setFormData] = useState({
    question: "",
    preview: "",
    fullAnswer: "",
    category: "Academic Stress",
    tags: "",
  });

  const categories = [
    {
      id: "all",
      label: "All Categories",
      icon: BookOpen,
      count: faqList.length,
    },
    {
      id: "Academic Stress",
      label: "Academic Stress",
      icon: BookOpen,
      count: faqList.filter((faq) => faq.category === "Academic Stress").length,
    },
    {
      id: "Mental Health",
      label: "Mental Health",
      icon: Heart,
      count: faqList.filter((faq) => faq.category === "Mental Health").length,
    },
    {
      id: "Campus Resources",
      label: "Campus Resources",
      icon: AlertCircle,
      count: faqList.filter((faq) => faq.category === "Campus Resources")
        .length,
    },
  ];

  const filteredFAQs = faqList.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  const handleAddFAQ = async () => {
    const newFAQ: FAQItem = {
      id: crypto.randomUUID(),
      question: formData.question,
      preview: formData.preview,
      fullAnswer: formData.fullAnswer,
      category: formData.category,
      tags: formData.tags.split(",").map((tag) => tag.trim()),
      createdDate: new Date().toISOString().split("T")[0],
      lastModified: new Date().toISOString().split("T")[0],
    };

    try {
      // TODO: Uncomment when API is ready
      // const savedFAQ = await createFAQ(newFAQ);
      // setFaqList([...faqList, savedFAQ]);

      // Using local state for now
      setFaqList([...faqList, newFAQ]);
      setShowAddModal(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create FAQ:", error);
    }
  };

  const handleEditFAQ = async () => {
    if (!editingFAQ) return;

    const updatedFAQ = {
      ...editingFAQ,
      question: formData.question,
      preview: formData.preview,
      fullAnswer: formData.fullAnswer,
      category: formData.category,
      tags: formData.tags.split(",").map((tag) => tag.trim()),
      lastModified: new Date().toISOString().split("T")[0],
    };

    try {
      // TODO: Uncomment when API is ready
      // await updateFAQ(editingFAQ.id, updatedFAQ);
      // setFaqList(faqList.map((faq) => (faq.id === editingFAQ.id ? updatedFAQ : faq)));

      // Using local state for now
      setFaqList(
        faqList.map((faq) => (faq.id === editingFAQ.id ? updatedFAQ : faq)),
      );
      setEditingFAQ(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update FAQ:", error);
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (
      confirm(
        "Are you sure you want to delete this FAQ? This action cannot be undone.",
      )
    ) {
      try {
        // TODO: Uncomment when API is ready
        // await deleteFAQ(id);
        // setFaqList(faqList.filter((faq) => faq.id !== id));

        // Using local state for now
        setFaqList(faqList.filter((faq) => faq.id !== id));
      } catch (error) {
        console.error("Failed to delete FAQ:", error);
      }
    }
  };

  const openEditModal = (faq: FAQItem) => {
    setEditingFAQ(faq);
    setFormData({
      question: faq.question,
      preview: faq.preview,
      fullAnswer: faq.fullAnswer,
      category: faq.category,
      tags: faq.tags.join(", "),
    });
  };

  const resetForm = () => {
    setFormData({
      question: "",
      preview: "",
      fullAnswer: "",
      category: "Academic Stress",
      tags: "",
    });
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingFAQ(null);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                FAQ Management
              </h1>
              <p className="text-gray-500 text-sm">
                Create and manage frequently asked questions for students
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-2xl hover:bg-teal-700 transition-all duration-200 font-semibold whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              Add New FAQ
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search FAQs by question, content, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category.id
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedCategory === category.id
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {category.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* FAQ List */}
        {isLoading ? (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">Loading FAQs...</p>
          </div>
        ) : filteredFAQs.length > 0 ? (
          <div className="space-y-4">
            {filteredFAQs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Left Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {faq.preview}
                    </p>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {faq.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Tag className="w-3.5 h-3.5" />
                        <span className="truncate">{faq.tags.join(", ")}</span>
                      </div>
                      <div className="text-xs text-gray-500 ml-auto">
                        Last Modified:{" "}
                        {new Date(faq.lastModified).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 lg:flex-col lg:items-stretch lg:gap-3">
                    <button
                      onClick={() => openEditModal(faq)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors text-sm font-semibold"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteFAQ(faq.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-32 h-32 mx-auto bg-teal-100 rounded-full flex items-center justify-center mb-6">
                <Search className="w-16 h-16 text-teal-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No FAQs found
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "Get started by creating your first FAQ"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-8 py-3 bg-teal-600 text-white rounded-2xl font-semibold shadow-lg hover:bg-teal-700 transition-all duration-200"
                >
                  Add Your First FAQ
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingFAQ) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-8 py-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingFAQ ? "Edit FAQ" : "Add New FAQ"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-8 py-8 space-y-6">
              {/* Question */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="e.g., How to apply for an extension?"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                />
              </div>

              {/* Preview Text */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Preview Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.preview}
                  onChange={(e) =>
                    setFormData({ ...formData, preview: e.target.value })
                  }
                  placeholder="Brief preview text shown on the card..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This is the short text displayed on FAQ cards
                </p>
              </div>

              {/* Full Answer */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Full Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.fullAnswer}
                  onChange={(e) =>
                    setFormData({ ...formData, fullAnswer: e.target.value })
                  }
                  placeholder="Provide a detailed answer to the question..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                >
                  <option value="Academic Stress">Academic Stress</option>
                  <option value="Mental Health">Mental Health</option>
                  <option value="Campus Resources">Campus Resources</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Tags <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="extension, deadline, coursework (comma-separated)"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Separate tags with commas to help students find this FAQ
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-8 py-6 rounded-b-3xl">
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-900 rounded-xl hover:bg-gray-100 transition-colors font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={editingFAQ ? handleEditFAQ : handleAddFAQ}
                  disabled={
                    !formData.question ||
                    !formData.preview ||
                    !formData.fullAnswer ||
                    !formData.tags
                  }
                  className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  {editingFAQ ? "Save Changes" : "Create FAQ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
