"use client";
import { useActionState, useState } from "react";
import { saveReminderRule } from "@/app/(admin)/actions";
import { reminderDates } from "@/lib/notifications/rules";
export function ReminderSettings({
  intervals,
  basis,
  repeat,
}: {
  intervals: number[];
  basis: string;
  repeat: number | null;
}) {
  const [message, action, pending] = useActionState(saveReminderRule, "");
  const [days, setDays] = useState(intervals.join(", "));
  const [mode, setMode] = useState(basis);
  const today = new Date().toISOString().slice(0, 10);
  return (
    <form action={action} className="card">
      <h2>Notifications</h2>
      <p>
        Administrator reminders use calendar dates in Asia/Colombo. New rules
        apply from tomorrow without backfilling old reminders.
      </p>
      <div className="grid">
        <label>
          Days after selected date
          <input
            name="intervals"
            value={days}
            onChange={(e) => setDays(e.target.value)}
          />
        </label>
        <label>
          Schedule starts from
          <select
            name="basis"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="sent">First successful send</option>
            <option value="due">Due date (after successful send)</option>
          </select>
        </label>
        <label>
          Repeat every N days (optional)
          <input
            type="number"
            name="repeat"
            min="1"
            max="365"
            defaultValue={repeat || ""}
          />
        </label>
      </div>
      <p className="muted">
        Example with today as the base date:{" "}
        {reminderDates(
          today,
          today,
          days
            .split(",")
            .map(Number)
            .filter((n) => Number.isInteger(n) && n > 0 && n <= 365),
          mode as "sent" | "due",
        ).join(", ")}
      </p>
      <button disabled={pending}>Save reminder rule</button>
      {message && <p role="status">{message}</p>}
    </form>
  );
}
