import "server-only";
import { cache } from "react";
import { requireAdmin } from "./require-admin";

// Deduplicate only within a server render. React discards this cache for each
// request; actions and HTTP handlers still call requireAdmin independently.
export const renderAdmin = cache(requireAdmin);
