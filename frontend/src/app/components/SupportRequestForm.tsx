import { ArrowRight, ChevronDown, HeartHandshake } from "lucide-react";
import { useState } from "react";
import type { UrgencyResult } from "../../utils/scoring";
import { UrgencyScreening } from "../components/UrgencyScreening";

type Step = "intro" | "screening" | "form";

export function SupportRequestForm() {
  const [step, setStep] = useState<Step>("intro");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [urgencyData, setUrgencyData] = useState<UrgencyResult | null>(null);
  const [errors, setErrors] = useState({ topic: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    topic: "Anxiety or Stress",
    description: "",
    urgency_level: "urgent",
  });

  const handleScreeningComplete = (result: UrgencyResult) => {
    setUrgencyData(result);
    const urgencyMap: Record<string, "urgent" | "medium" | "low"> = {
      urgent: "urgent",
      medium: "medium",
      low: "low",
    };
    setFormData((prev) => ({
      ...prev,
      urgency_level: urgencyMap[result.urgency_level] || "urgent",
    }));
    setStep("form");
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { topic: "", description: "" };

    if (!formData.topic || formData.topic.trim() === "") {
      newErrors.topic = "Please select a topic";
    }
    if (formData.description.trim().length < 5) {
      newErrors.description = `Please provide more detail (${formData.description.trim().length}/5)`;
    }

    setErrors(newErrors);

    if (newErrors.topic || newErrors.description) {
      return;
    }

    setIsSubmitting(true);

    try {
      const userId = localStorage.getItem("user_id") || "1";

      const response = await fetch("http://localhost:5001/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: parseInt(userId, 10),
          topic: formData.topic,
          description: formData.description.trim(),
          urgency_level: formData.urgency_level,
        }),
      });

      if (response.ok) {
        alert("Support request submitted successfully! 💙");
        setFormData({
          topic: "Anxiety or Stress",
          description: "",
          urgency_level: "urgent",
        });
        setErrors({ topic: "", description: "" });
        setUrgencyData(null);
        setStep("intro");
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(
          errorData.message || "Failed to submit request. Please try again.",
        );
      }
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Error submitting request. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
      {/* 1. Landing Page (Intro) */}
      {step === "intro" && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-10 sm:p-14 w-full max-w-2xl text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <HeartHandshake className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How can we support you?
          </h1>
          <p className="text-lg text-gray-500 mb-10 leading-relaxed max-w-lg mx-auto">
            Before you fill out the request form, we'd like to ask a few quick
            questions to understand how you're feeling today. This helps our
            wellbeing team prioritize your request and provide the best support.
          </p>
          <button
            onClick={() => setStep("screening")}
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 hover:gap-4"
          >
            Start Quick Check-in <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 2. Urgency Screening */}
      {step === "screening" && (
        <UrgencyScreening onComplete={handleScreeningComplete} />
      )}

      {/* 3. Main Request Form */}
      {step === "form" && (
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10 w-full max-w-3xl animate-in fade-in slide-in-from-right-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Request Support
          </h2>
          <p className="text-gray-500 mb-8">
            Please provide some details about what you'd like to discuss.
          </p>

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Primary Topic
              </label>
              <div className="relative">
                <select
                  value={formData.topic}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, topic: e.target.value }))
                  }
                  className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 appearance-none cursor-pointer"
                >
                  <option value="Anxiety or Stress">Anxiety or Stress</option>
                  <option value="Academic Pressure">Academic Pressure</option>
                  <option value="Relationship Issues">
                    Relationship Issues
                  </option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.topic && (
                <p className="text-red-500 text-sm mt-1">{errors.topic}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50/50 resize-none"
                placeholder="Please describe what you'd like support with..."
              ></textarea>
              <div className="flex justify-between items-center mt-2">
                <p className="text-gray-500 text-xs">
                  {formData.description.trim().length}/5 characters minimum
                </p>
                {errors.description && (
                  <p className="text-red-500 text-sm">{errors.description}</p>
                )}
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
