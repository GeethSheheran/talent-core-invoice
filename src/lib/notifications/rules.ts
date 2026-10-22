import { addDays } from "@/lib/utils/dates";
export function reminderDates(
  sent: string | null,
  due: string,
  intervals: number[],
  basis: "sent" | "due" = "sent",
) {
  if (!sent) return [];
  return [...new Set(intervals)]
    .sort((a, b) => a - b)
    .map((n) => addDays(basis === "sent" ? sent : due, n));
}
export function dueReminders(input: {
  sent: string | null;
  due: string;
  intervals: number[];
  today: string;
  effectiveFrom: string;
  state: string;
  outstanding: number;
  paused: boolean;
  existing: string[];
}) {
  if (input.state !== "issued" || input.outstanding <= 0 || input.paused)
    return [];
  return reminderDates(input.sent, input.due, input.intervals).filter(
    (d) =>
      d <= input.today &&
      d >= input.effectiveFrom &&
      !input.existing.includes(d),
  );
}
