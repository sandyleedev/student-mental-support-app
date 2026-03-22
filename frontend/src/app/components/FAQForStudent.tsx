import { AlertCircle, BookOpen, Heart, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  preview: string;
  fullAnswer: string;
  category: string;
  tags: string[];
}

interface FAQProps {
  onNavigateToSupport?: () => void;
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
  },
  {
    id: "4",
    question: "Understanding academic probation",
    preview:
      "A quick guide to what probation means for your studies and how you can get support...",
    fullAnswer:
      "Academic probation occurs when your GPA falls below the required threshold (typically 2.0). During probation: 1) You will receive academic advising support, 2) You may have course load restrictions, 3) You must improve your GPA within one semester, 4) Additional resources are available including tutoring and study skills workshops. Contact Academic Support Services for personalized guidance.",
    category: "Academic Stress",
    tags: ["probation", "academic", "gpa", "support"],
  },
  {
    id: "5",
    question: "What if I miss a major deadline?",
    preview:
      "...If you are struggling to meet a deadline due to mental health issues, you may be eligible for...",
    fullAnswer:
      "If you miss a major deadline due to circumstances beyond your control (illness, emergency, mental health crisis), you should: 1) Contact your professor immediately, 2) Provide documentation if possible, 3) Request a meeting to discuss options, 4) Contact the Student Support Office for advocacy. For mental health-related issues, our counseling center can provide documentation and support.",
    category: "Academic Stress",
    tags: ["deadline", "late", "extension", "mental health"],
  },
  {
    id: "6",
    question: "Applying for an assignment extension",
    preview:
      "...Request an extension before the final deadline. Forms are available online...",
    fullAnswer:
      'Assignment extension requests should be submitted at least 48 hours before the due date when possible. Log into the student portal, go to My Courses, select the relevant assignment, and click "Request Extension." You will need to provide a reason and any supporting documentation. Typical reasons include illness, family emergency, or technical difficulties. Extensions are reviewed within 24 hours.',
    category: "Academic Stress",
    tags: ["assignment", "extension", "deadline", "request"],
  },
  {
    id: "7",
    question: "How to filter a student?",
    preview:
      "Learn how to use search and filter options to find relevant information...",
    fullAnswer:
      'You can filter information in several ways: 1) Use the search bar at the top to search by keywords, 2) Click on category tags to filter by topic, 3) Use the "All" button to reset filters. The search is smart and will find relevant results based on question content, not just titles.',
    category: "Campus Resources",
    tags: ["search", "filter", "help", "navigation"],
  },
  {
    id: "8",
    question: "Dealing with homesickness",
    preview:
      "Strategies and resources to help you cope with being away from home...",
    fullAnswer:
      "Homesickness is a normal part of the college experience. Try these strategies: 1) Stay connected with family through regular video calls, 2) Create a comfortable space in your dorm, 3) Join clubs and activities to build new connections, 4) Maintain healthy routines, 5) Give yourself time to adjust. Our counseling center offers support groups for students dealing with homesickness.",
    category: "Mental Health",
    tags: ["homesickness", "mental health", "coping", "support"],
  },
  {
    id: "9",
    question: "How to access mental health resources?",
    preview:
      "Information about available mental health services and how to book appointments...",
    fullAnswer:
      "CampusCompass offers several mental health resources: 1) One-on-one counseling sessions (book through the platform), 2) Group therapy and workshops, 3) Crisis support available 24/7, 4) Self-help resources and apps, 5) Peer support programs. All services are free and confidential for enrolled students. Book your first appointment through the Booking section.",
    category: "Mental Health",
    tags: ["mental health", "counseling", "resources", "therapy"],
  },
  {
    id: "10",
    question: "Study skills and time management workshops",
    preview:
      "Join our workshops to improve your academic performance and manage your time better...",
    fullAnswer:
      "We offer regular workshops on: 1) Effective study techniques, 2) Time management strategies, 3) Note-taking skills, 4) Exam preparation, 5) Research and writing skills. Check the Activities section for upcoming workshop schedules. Workshops are free, interactive, and led by experienced academic advisors. You can also book one-on-one academic coaching sessions.",
    category: "Academic Stress",
    tags: ["study skills", "workshop", "time management", "academic"],
  },
  {
    id: "11",
    question: "Crisis support - when to seek immediate help",
    preview:
      "Understand when to reach out for emergency support and available crisis resources...",
    fullAnswer:
      "Seek immediate help if you are: 1) Having thoughts of self-harm, 2) Experiencing a mental health crisis, 3) In immediate danger. Available resources: Campus Security (24/7): 123-456-7890, Emergency Services: 999, Crisis Hotline: 0800-123-4567. The counseling center also has walk-in crisis appointments during business hours. You are never alone - help is always available.",
    category: "Mental Health",
    tags: ["crisis", "emergency", "mental health", "support", "urgent"],
  },
  {
    id: "12",
    question: "Campus wellness activities and events",
    preview:
      "Explore upcoming wellness events, meditation sessions, and stress-relief activities...",
    fullAnswer:
      "Join our regular wellness activities: 1) Mindfulness meditation sessions (Tuesdays, 5 PM), 2) Yoga classes (Mondays and Thursdays, 6 PM), 3) Art therapy workshops (Fridays, 4 PM), 4) Nature walks (Weekends, 10 AM), 5) Stress-relief events during exam periods. All activities are free and open to all students. Check the Activities Dashboard for the full schedule and to register.",
    category: "Campus Resources",
    tags: ["wellness", "activities", "events", "meditation", "yoga"],
  },
];

// TODO: Create API service function
// Example:
// async function fetchFAQs(): Promise<FAQItem[]> {
//   const response = await fetch('/api/faqs');
//   return response.json();
// }

export function FAQForStudent({ onNavigateToSupport }: FAQProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFAQ, setSelectedFAQ] = useState<FAQItem | null>(null);
  const [faqData, setFaqData] = useState<FAQItem[]>(MOCK_FAQ_DATA);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace with actual API call
  useEffect(() => {
    const loadFAQs = async () => {
      setIsLoading(true);
      try {
        // TODO: Uncomment when API is ready
        // const data = await fetchFAQs();
        // setFaqData(data);

        // Using mock data for now
        setFaqData(MOCK_FAQ_DATA);
      } catch (error) {
        console.error("Failed to load FAQs:", error);
        setFaqData(MOCK_FAQ_DATA);
      } finally {
        setIsLoading(false);
      }
    };

    loadFAQs();
  }, []);

  const categories = [
    { id: "all", label: "All", icon: BookOpen },
    { id: "Academic Stress", label: "Academic Stress", icon: BookOpen },
    { id: "Mental Health", label: "Mental Health", icon: Heart },
    { id: "Campus Resources", label: "Campus Resources", icon: AlertCircle },
  ];

  const filteredFAQs = faqData.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.fullAnswer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    return matchesCategory && matchesSearch;
  });

  const handleFAQClick = (faq: FAQItem) => {
    setSelectedFAQ(faq);
  };

  const handleCloseModal = () => {
    setSelectedFAQ(null);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-gray-600">
            Find answers to common questions about campus resources and support
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for topics (e.g., Anxiety, Extensions, Sleep...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent shadow-sm"
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
                    ? "bg-blue-500 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Results Header */}
        {searchQuery && filteredFAQs.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Showing results for:{" "}
              <span className="font-semibold text-gray-900">
                "{searchQuery}"
              </span>
            </p>
          </div>
        )}

        {/* FAQ Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading FAQs...</p>
          </div>
        ) : filteredFAQs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFAQs.map((faq) => (
              <button
                key={faq.id}
                onClick={() => handleFAQClick(faq)}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200 text-left group cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {faq.question}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {faq.preview}
                </p>
              </button>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="max-w-md mx-auto">
              {/* Illustration */}
              <div className="mb-6">
                <div className="w-32 h-32 mx-auto bg-linear-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center">
                  <Search className="w-16 h-16 text-blue-500" />
                </div>
              </div>

              <h3 className="text-2xl text-gray-900 mb-3">
                We couldn't find exactly what you're looking for
              </h3>
              <p className="text-gray-600 mb-8">
                But you can always create a new support request and our team
                will help you!
              </p>

              <button
                onClick={() => {
                  onNavigateToSupport?.();
                }}
                className="px-8 py-3 bg-blue-500 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                Open New Support Request
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Backdrop */}
      {selectedFAQ && (
        <div
          className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"
          onClick={handleCloseModal}
        >
          {/* Modal Card */}
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-8 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex-1 pr-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedFAQ.question}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                    {selectedFAQ.category}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
                {selectedFAQ.fullAnswer}
              </div>

              {/* Tags */}
              {selectedFAQ.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <p className="text-sm font-medium text-gray-600 mb-3">
                    Related topics:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFAQ.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-200 bg-gray-50 flex justify-end"></div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
