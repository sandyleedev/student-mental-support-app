import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Sparkles,
  User,
} from "lucide-react";
import { useState } from "react";

type Step = 1 | 2 | 3 | 4;
type ServiceType = "session" | "workshop";

type Workshop = {
  id: string;
  title: string;
  facilitator: string;
};

type TimeSlot = {
  id: string;
  date: string;
  time: string;
  availableSlots: number;
};

export function StudentBooking() {
  const [step, setStep] = useState<Step>(1);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [selectedWorkshop, setSelectedWorkshop] = useState<Workshop | null>(
    null,
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingStatus, setBookingStatus] = useState<
    "idle" | "submitting" | "success"
  >("idle");

  // --- Mock Data (Future API Calls) ---
  const [availableWorkshops] = useState<Workshop[]>([
    {
      id: "w1",
      title: "Exam Stress Relief Group",
      facilitator: "Dr. Sarah Mitchell",
    },
    {
      id: "w2",
      title: "Mindfulness & Meditation",
      facilitator: "Dr. James Chen",
    },
    {
      id: "w3",
      title: "Social Anxiety Workshop",
      facilitator: "Ms. Emily Rodriguez",
    },
  ]);

  const [availableSlots] = useState<TimeSlot[]>([
    { id: "s1", date: "2026-03-12", time: "10:00", availableSlots: 3 },
    { id: "s2", date: "2026-03-12", time: "14:00", availableSlots: 1 },
    { id: "s3", date: "2026-03-13", time: "09:00", availableSlots: 5 },
  ]);

  const handleNext = () => setStep((prev) => (prev + 1) as Step);
  const handleBack = () => {
    if (step === 3 && serviceType === "session") {
      setStep(1);
    } else {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  const selectService = (type: ServiceType) => {
    setServiceType(type);
    if (type === "session") {
      setStep(3);
    } else {
      setStep(2);
    }
  };

  const handleConfirm = async () => {
    setBookingStatus("submitting");
    await new Promise((resolve) => setTimeout(resolve, 1000)); // [API Placeholder]
    setBookingStatus("success");
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-8 px-10">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 z-10 ${
                  step >= i
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > i ? <CheckCircle className="w-5 h-5" /> : i}
              </div>
              {i < 4 && (
                <div
                  className={`absolute left-8 w-[calc(100%+2rem)] h-1 transition-all duration-500 ${
                    step > i ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10 min-h-125 flex flex-col relative overflow-hidden">
          {step === 1 && (
            <div className="flex-1 animate-in fade-in slide-in-from-bottom-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                How can we help?
              </h2>
              <p className="text-gray-500 mb-8">
                Select the type of support you need today.
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => selectService("session")}
                  className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        1-on-1 Counseling
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Private and confidential professional support.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>

                <button
                  onClick={() => selectService("workshop")}
                  className="w-full p-6 rounded-2xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/50 transition-all text-left group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        Well-being Workshop
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Group sessions focusing on specific skills.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 mb-6 hover:underline"
              >
                <ChevronLeft className="w-4 h-4" /> Back to service
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Select a Workshop
              </h2>
              <div className="space-y-3">
                {availableWorkshops.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      setSelectedWorkshop(w);
                      handleNext();
                    }}
                    className="w-full p-5 rounded-2xl border-2 border-gray-100 hover:border-blue-500 text-left transition-all"
                  >
                    <h4 className="font-bold text-gray-900">{w.title}</h4>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                      <User className="w-3.5 h-3.5" /> {w.facilitator}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 mb-6 hover:underline"
              >
                <ChevronLeft className="w-4 h-4" /> Go back
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Pick a Time Slot
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Available times for{" "}
                {serviceType === "session"
                  ? "1-on-1 Counseling"
                  : selectedWorkshop?.title}
              </p>

              <div className="grid grid-cols-1 gap-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => {
                      setSelectedSlot(slot);
                      handleNext();
                    }}
                    className="w-full p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg shadow-sm text-blue-600">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-bold text-gray-900">
                          {new Date(slot.date).toLocaleDateString("en-GB", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </div>
                        <div className="text-xs text-gray-500">{slot.time}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-600">
                      {slot.availableSlots} slots left
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 flex flex-col">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 mb-6 hover:underline"
              >
                <ChevronLeft className="w-4 h-4" /> Change details
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Confirm your booking
              </h2>

              <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 flex-1 mb-8 space-y-4">
                <div className="flex justify-between">
                  <span className="text-blue-600 text-sm font-medium">
                    Type
                  </span>
                  <span className="font-bold text-gray-900">
                    {serviceType === "session"
                      ? "1-on-1 Counseling"
                      : "Workshop"}
                  </span>
                </div>
                {serviceType === "workshop" && (
                  <div className="flex justify-between">
                    <span className="text-blue-600 text-sm font-medium">
                      Activity
                    </span>
                    <span className="font-bold text-gray-900">
                      {selectedWorkshop?.title}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-blue-600 text-sm font-medium">
                    Date
                  </span>
                  <span className="font-bold text-gray-900">
                    {selectedSlot?.date}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-600 text-sm font-medium">
                    Time
                  </span>
                  <span className="font-bold text-gray-900">
                    {selectedSlot?.time}
                  </span>
                </div>
              </div>

              <button
                onClick={handleConfirm}
                disabled={bookingStatus === "submitting"}
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 mb-2"
              >
                {bookingStatus === "submitting"
                  ? "Processing..."
                  : "Confirm Appointment"}
              </button>
            </div>
          )}
        </div>
      </div>

      {bookingStatus === "success" && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-sm w-full text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sparkles className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">All set!</h3>
            <p className="text-sm text-gray-500 mb-8 leading-relaxed">
              Your booking is confirmed. You can view it anytime in "My
              Bookings".
            </p>
            <button
              onClick={() => {
                setBookingStatus("idle");
                setStep(1);
              }}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-colors"
            >
              Great, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
