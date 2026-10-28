"use server";
import { loadNotificationPreview } from "@/lib/notifications/preview";
export async function getNotificationPreview() {
  // The loader independently verifies administrator access on every request.
  return loadNotificationPreview();
}
