import {
  ArrowRight,
  Calendar,
  CheckCircle,
  ChevronLeft,
  Clock,
  MapPin,
  Sparkles,
  User,
} from "lucide-react";
import React, { useState } from "react";

type Step = 1 | 2 | 3;
type ServiceType = "session" | "workshop";

type TimeSlot = {
  id: string;
  date: string;
  time: string;
  facilitator: string;
};

type WorkshopEvent = {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  facilitator: string;
  location: string;
  availableSlots: number;
};

// --- Mock Data ---
const MOCK_SESSION_SLOTS: TimeSlot[] = [
  { id: "s1", date: "2026-03-12", time: "14:00", facilitator: "Emily Gilmore" },
  {
    id: "s2",
    date: "2026-03-13",
    time: "09:00",
    facilitator: "Dr. James Chen",
  },
  {
    id: "s3",
    date: "2026-03-16",
    time: "10:00",
    facilitator: "Dr. Sarah Mitchell",
  },
  { id: "s4", date: "2026-03-18", time: "15:00", facilitator: "Emily Gilmore" },
  {
    id: "s5",
    date: "2026-03-24",
    time: "11:00",
    facilitator: "Dr. James Chen",
  },
];

const MOCK_WORKSHOPS: WorkshopEvent[] = [
  {
    id: "w1",
    title: "Mindfulness & Meditation",
    date: "2026-03-16",
    time: "10:00",
    duration: "90 min",
    facilitator: "Dr. James Chen",
    location: "Wellness Hall",
    availableSlots: 5,
  },
  {
    id: "w2",
    title: "Exam Stress Relief Group",
    date: "2026-03-19",
    time: "15:30",
    duration: "120 min",
    facilitator: "Emily Gilmore",
    location: "Library Room A",
    availableSlots: 0,
  },
  {
    id: "w3",
    title: "Social Anxiety Support",
    date: "2026-03-23",
    time: "14:00",
    duration: "60 min",
    facilitator: "Emily Gilmore",
    location: "Room 204",
    availableSlots: 12,
  },
];

export function StudentBooking() {
  const [step, setStep] = useState<Step>(1);
  const [serviceType, setServiceType] = useState<ServiceType | null>(null);
  const [selectedItem, setSelectedItem] = useState<
    TimeSlot | WorkshopEvent | null
  >(null);
  const [bookingStatus, setBookingStatus] = useState<
    "idle" | "submitting" | "success"
  >("idle");

  const handleNext = () => setStep((prev) => (prev + 1) as Step);
  const handleBack = () => setStep((prev) => (prev - 1) as Step);

  const selectService = (type: ServiceType) => {
    setServiceType(type);
    setSelectedItem(null);
    setStep(2);
  };

  const handleConfirm = async () => {
    setBookingStatus("submitting");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setBookingStatus("success");
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8 flex justify-center">
      <div className="w-full max-w-xl">
        <div className="flex items-center justify-between mb-8 px-4 sm:px-8">
          {[1, 2, 3].map((i, index) => (
            <React.Fragment key={i}>
              <div className="flex items-center relative z-10 shrink-0">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= i
                      ? "bg-blue-600 text-white ring-4 ring-blue-100"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > i ? <CheckCircle className="w-5 h-5" /> : i}
                </div>
              </div>

              {index < 2 && (
                <div
                  className={`flex-1 h-1 mx-2 sm:mx-4 rounded transition-all duration-300 ${
                    step > i ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 p-8 sm:p-10 min-h-[500px] flex flex-col relative overflow-hidden">
          {/* STEP 1: Service Type */}
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
                        Team Workshop
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Group sessions focusing on specific well-being skills.
                      </p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Selection */}
          {step === 2 && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 flex flex-col h-full">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 mb-6 hover:underline w-fit"
              >
                <ChevronLeft className="w-4 h-4" /> Go back
              </button>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {serviceType === "session"
                  ? "Pick a Time Slot"
                  : "Select a Workshop"}
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                {serviceType === "session"
                  ? "Showing available 1-on-1 sessions for the next two weeks."
                  : "Upcoming group activities and workshops."}
              </p>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-4">
                {/* 💡 1-on-1 sessions */}
                {serviceType === "session" &&
                  MOCK_SESSION_SLOTS.map((slot) => {
                    const isSelected = selectedItem?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => {
                          setSelectedItem(slot);
                          handleNext();
                        }}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between text-left ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">
                              {formatDate(slot.date)} at {slot.time}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />{" "}
                              {slot.facilitator}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-green-700 bg-green-100/80 px-2.5 py-1 rounded-md">
                          Available
                        </span>
                      </button>
                    );
                  })}

                {/* workshops */}
                {serviceType === "workshop" &&
                  MOCK_WORKSHOPS.map((workshop) => {
                    const isFull = workshop.availableSlots === 0;
                    const isSelected = selectedItem?.id === workshop.id;

                    return (
                      <button
                        key={workshop.id}
                        disabled={isFull}
                        onClick={() => {
                          setSelectedItem(workshop);
                          handleNext();
                        }}
                        className={`w-full p-4 rounded-xl border-2 transition-all flex flex-col text-left relative overflow-hidden ${
                          isFull
                            ? "bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed"
                            : isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm"
                        }`}
                      >
                        {isFull && (
                          <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                            FULL
                          </div>
                        )}

                        <div className="flex justify-between items-start mb-3">
                          <h4
                            className={`font-bold text-base pr-8 ${isFull ? "text-gray-600" : "text-gray-900"}`}
                          >
                            {workshop.title}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 w-full">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />{" "}
                            {formatDate(workshop.date)}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {workshop.time} (
                            {workshop.duration})
                          </div>
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" />{" "}
                            {workshop.facilitator}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />{" "}
                            {workshop.location}
                          </div>
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* STEP 3: Confirmation */}
          {step === 3 && selectedItem && (
            <div className="flex-1 animate-in fade-in slide-in-from-right-4 flex flex-col">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-semibold text-blue-600 mb-6 hover:underline w-fit"
              >
                <ChevronLeft className="w-4 h-4" /> Change selection
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Confirm your booking
              </h2>

              <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 flex-1 mb-8 space-y-5">
                <div className="flex justify-between items-center border-b border-blue-100 pb-4">
                  <span className="text-blue-600 text-sm font-medium">
                    Service
                  </span>
                  <span className="font-bold text-gray-900 bg-white px-3 py-1 rounded-lg border border-blue-100 shadow-sm">
                    {serviceType === "session"
                      ? "1-on-1 Counseling"
                      : "Team Workshop"}
                  </span>
                </div>

                {serviceType === "workshop" && "title" in selectedItem && (
                  <div className="flex justify-between items-start">
                    <span className="text-blue-600 text-sm font-medium">
                      Event
                    </span>
                    <span className="font-bold text-gray-900 text-right max-w-[60%]">
                      {selectedItem.title}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-blue-600 text-sm font-medium">
                    Date & Time
                  </span>
                  <span className="font-bold text-gray-900">
                    {formatDate(selectedItem.date)} at {selectedItem.time}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-blue-600 text-sm font-medium">
                    Counselor
                  </span>
                  <span className="font-bold text-gray-900">
                    {selectedItem.facilitator}
                  </span>
                </div>

                {serviceType === "workshop" && "location" in selectedItem && (
                  <div className="flex justify-between items-center">
                    <span className="text-blue-600 text-sm font-medium">
                      Location
                    </span>
                    <span className="font-bold text-gray-900">
                      {selectedItem.location}
                    </span>
                  </div>
                )}
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

      {/* Success Modal */}
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
                setSelectedItem(null);
                setServiceType(null);
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
