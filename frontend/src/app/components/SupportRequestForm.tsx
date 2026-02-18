import { AlertCircle, Heart, Send } from "lucide-react";
import { useState } from "react";

export function SupportRequestForm() {
  const [formData, setFormData] = useState({
    topic: "",
    description: "",
    // urgencyLevel: "medium",
  });

  const [errors, setErrors] = useState({
    topic: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = { topic: "", description: "" };
    if (!formData.topic) newErrors.topic = "Please select a topic";
    if (formData.description.length < 5) {
      newErrors.description = `Please provide more detail (${formData.description.length}/5)`;
    }

    setErrors(newErrors);

    if (!newErrors.topic && !newErrors.description) {
      try {
        const userId = localStorage.getItem("user_id") || "1";

        const response = await fetch("http://localhost:5001/api/threads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            student_id: parseInt(userId),
            topic: formData.topic,
            description: formData.description,
            // urgency: formData.urgencyLevel.toUpperCase(),
          }),
        });

        if (response.ok) {
          alert("Support request submitted successfully! 💙");
          setFormData({ topic: "", description: "" });
        }
      } catch (error) {
        console.error("Submission failed:", error);
      }
    }
  };

  //   const urgencyLevels = [
  //     {
  //       value: "low",
  //       label: "Low",
  //       color: "bg-green-100 text-green-700 border-green-300",
  //     },
  //     {
  //       value: "medium",
  //       label: "Medium",
  //       color: "bg-yellow-100 text-yellow-700 border-yellow-300",
  //     },
  //     {
  //       value: "high",
  //       label: "High",
  //       color: "bg-rose-100 text-rose-700 border-rose-300",
  //     },
  //   ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
          <Heart className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          New Support Request
        </h1>
        <p className="text-gray-600">
          Your information will remain anonymous to the counselor.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8"
      >
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Topic *
          </label>
          <select
            value={formData.topic}
            onChange={(e) =>
              setFormData({ ...formData, topic: e.target.value })
            }
            className={`w-full px-4 py-3 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-300 outline-none ${
              errors.topic ? "border-rose-300" : "border-gray-200"
            }`}
          >
            <option value="">Select a topic...</option>
            <option value="Academic Stress">Academic Stress</option>
            <option value="Personal Well-being">Personal Well-being</option>
            <option value="Social/Relationship">Social/Relationship</option>
            <option value="Other">Other</option>
          </select>
          {errors.topic && (
            <p className="text-rose-600 text-sm flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {errors.topic}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={5}
            placeholder="Tell us what's on your mind..."
            className={`w-full px-4 py-3 border rounded-2xl bg-gray-50 focus:ring-2 focus:ring-blue-300 outline-none ${
              errors.description ? "border-rose-300" : "border-gray-200"
            }`}
          />
        </div>

        {/* <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Urgency Level *
          </label>
          <div className="grid grid-cols-3 gap-3 p-1.5 bg-gray-100 rounded-2xl">
            {urgencyLevels.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() =>
                  setFormData({ ...formData, urgencyLevel: level.value })
                }
                className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                  formData.urgencyLevel === level.value
                    ? `${level.color} shadow-sm`
                    : "bg-white text-gray-500"
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div> */}

        <button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" /> Submit Request
        </button>
      </form>
    </div>
  );
}
