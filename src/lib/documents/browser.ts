import "server-only";
import { access, constants } from "node:fs/promises";
import chromium from "@sparticuz/chromium";

export async function browserOptions() {
  const configured = process.env.CHROME_EXECUTABLE_PATH;
  const candidates = configured
    ? [configured]
    : process.platform === "darwin"
      ? [
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
          "/Applications/Chromium.app/Contents/MacOS/Chromium",
        ]
      : process.platform === "win32"
        ? [
            "C:/Program Files/Google/Chrome/Application/chrome.exe",
            "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
          ]
        : [];
  for (const executablePath of candidates) {
    try {
      await access(executablePath, constants.X_OK);
      return { executablePath, args: [] as string[], headless: true as const };
    } catch {
      /* Try the next installed browser. */
    }
  }
  if (configured || process.platform !== "linux") {
    throw new Error(
      "No usable PDF browser was found. Install Chrome or set CHROME_EXECUTABLE_PATH to its executable, then restart the app.",
    );
  }
  return {
    executablePath: await chromium.executablePath(),
    args: chromium.args,
    headless: true as const,
  };
}
