"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function LiveBillingRefresh() {
  const router = useRouter();
  useEffect(() => {
    const channel =
      typeof BroadcastChannel !== "undefined"
        ? new BroadcastChannel("ledger-billing")
        : null;
    const refresh = () => {
      if (document.visibilityState === "visible") router.refresh();
    };
    const changed = () => {
      refresh();
      channel?.postMessage("updated");
    };
    if (channel) channel.onmessage = refresh;
    const timer = window.setInterval(refresh, 60000);
    window.addEventListener("billing-updated", changed);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      channel?.close();
      window.removeEventListener("billing-updated", changed);
      window.removeEventListener("focus", refresh);
    };
  }, [router]);
  return null;
}
