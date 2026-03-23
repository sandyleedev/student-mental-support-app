export type UrgencyLevel = "NORMAL" | "HIGH" | "CRITICAL";

export interface UrgencyResult {
  score: number;
  urgency_level: string;
}

export const SCREENING_QUESTIONS = [
  { id: "q1", text: "How overwhelmed do you feel today?" },
  { id: "q2", text: "How difficult is it to concentrate?" },
  { id: "q3", text: "Are you having trouble sleeping or eating?" },
  { id: "q4", text: "Have you felt hopeless recently?" },
  { id: "q5", text: "Are you struggling to cope with daily life?" },
];

export const calculateUrgency = (
  answers: Record<string, number>,
): UrgencyResult => {
  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);

  const isHopelessCritical = answers["q4"] >= 4;
  const isCopingCritical = answers["q5"] >= 4;

  if (isHopelessCritical || isCopingCritical || totalScore >= 18) {
    return { score: totalScore, urgency_level: "urgency" };
  }

  if (totalScore >= 12) {
    return { score: totalScore, urgency_level: "medium" };
  }

  return { score: totalScore, urgency_level: "low" };
};
