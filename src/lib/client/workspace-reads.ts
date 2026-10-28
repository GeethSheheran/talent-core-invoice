import type {
  loadCompanyEditor as Editor,
  loadCompanyRecord as Record,
} from "@/app/(admin)/company-actions";
import type { getNotificationPreview as Preview } from "@/app/(admin)/notification-actions";
// GET reads do not enter the Server Action mutation queue. No browser cache of
// billing state is retained; successful mutations always fetch fresh records.
async function read<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "same-origin",
  });
  const result = await response.json();
  if (!response.ok && response.status !== 422)
    throw new Error(
      typeof result.error === "string"
        ? result.error
        : "Unable to load. Please retry.",
    );
  return result as T;
}
export function loadCompanyEditor(company: string, collection: string) {
  return read<Awaited<ReturnType<typeof Editor>>>(
    `/api/companies/${encodeURIComponent(company)}/workspace?${new URLSearchParams({ collection })}`,
  );
}
export function loadCompanyRecord(
  company: string,
  collection: string,
  record: string,
) {
  return read<Awaited<ReturnType<typeof Record>>>(
    `/api/companies/${encodeURIComponent(company)}/workspace?${new URLSearchParams({ collection, record })}`,
  );
}
export function getNotificationPreview() {
  return read<Awaited<ReturnType<typeof Preview>>>(
    "/api/notifications/preview",
  );
}
