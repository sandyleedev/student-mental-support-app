import { AlertTriangle, HeartPulse, Phone, Shield } from "lucide-react";
import { useState } from "react";
import {
  calculateUrgency,
  SCREENING_QUESTIONS,
  type UrgencyResult,
} from "../../utils/scoring";

interface UrgencyScreeningProps {
  onComplete: (result: UrgencyResult) => void;
}

export function UrgencyScreening({ onComplete }: UrgencyScreeningProps) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const [calculatedResult, setCalculatedResult] =
    useState<UrgencyResult | null>(null);

  const handleSelect = (questionId: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const isComplete = Object.keys(answers).length === SCREENING_QUESTIONS.length;

  const handleSubmit = () => {
    if (!isComplete) return;
    const result = calculateUrgency(answers);
    setCalculatedResult(result);

    if (result.urgency_level === "urgency") {
      setShowCrisisAlert(true);
    } else {
      onComplete(result);
    }
  };

  if (showCrisisAlert && calculatedResult) {
    return (
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border-4 border-red-500 animate-in fade-in zoom-in duration-300">
        <div className="bg-red-50 p-8 text-center border-b border-red-100 relative">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 relative">
            <Phone className="w-10 h-10 text-red-600" />
            <div className="absolute -top-1 -right-1">
              <HeartPulse className="w-6 h-6 text-red-500 fill-red-500" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-red-700 uppercase tracking-wide">
            We Are Here For You
          </h2>
        </div>

        <div className="p-6 sm:p-10">
          <p className="text-gray-700 text-base leading-relaxed text-center mb-8 font-medium">
            It sounds like you are going through a tough time right now.
            Immediate support is available. Please reach out to one of the
            resources below:
          </p>

          <div className="space-y-4 mb-10">
            <a
              href="tel:1234567890"
              className="flex items-center justify-between p-5 rounded-2xl border-2 border-red-100 bg-white hover:border-red-500 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-red-50 p-3 rounded-xl text-red-600">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Campus Security (24/7)
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    0121 414 4444
                  </p>
                </div>
              </div>
              <div className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold group-hover:bg-red-700 transition-colors">
                Call
              </div>
            </a>

            <a
              href="tel:999"
              className="flex items-center justify-between p-5 rounded-2xl border-2 border-gray-100 bg-white hover:border-gray-300 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="bg-gray-100 p-3 rounded-xl text-gray-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                    Emergency Services
                  </p>
                  <p className="text-xl font-bold text-gray-900">999</p>
                </div>
              </div>
              <div className="bg-gray-200 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-bold group-hover:bg-gray-300 transition-colors">
                Call
              </div>
            </a>
          </div>

          <button
            onClick={() => onComplete(calculatedResult)}
            className="w-full bg-white border-2 border-gray-200 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            Continue to Request Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10 w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Just a Quick Check-in
        </h2>
        <p className="text-gray-500">
          Please answer honestly so we can provide the best support.
        </p>
      </div>

      <div className="flex justify-end mb-4 pr-2">
        <div className="flex w-[60%] sm:w-1/2 justify-between text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
          <span>Not at all (1)</span>
          <span>Extremely (5)</span>
        </div>
      </div>

      <div className="space-y-3">
        {SCREENING_QUESTIONS.map((q) => (
          <div
            key={q.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors border border-gray-100 gap-4"
          >
            <p className="text-sm font-semibold text-gray-700 sm:w-1/2">
              {q.text}
            </p>
            <div className="flex w-full sm:w-1/2 justify-between items-center px-1">
              {[1, 2, 3, 4, 5].map((value) => {
                const isSelected = answers[q.id] === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleSelect(q.id, value)}
                    className={`w-10 h-10 rounded-full text-sm font-bold transition-all duration-200 flex items-center justify-center
                      ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110 ring-2 ring-blue-600 ring-offset-2"
                          : "bg-white text-gray-500 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-500"
                      }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 pt-6 border-t border-gray-100">
        <button
          onClick={handleSubmit}
          disabled={!isComplete}
          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-xl shadow-blue-100"
        >
          Submit & Continue
        </button>
      </div>
    </div>
  );
}
