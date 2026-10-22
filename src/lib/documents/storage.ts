import "server-only";
import { createHash } from "node:crypto";
import { privileged } from "@/lib/supabase/privileged";
import { requireAdmin } from "@/lib/auth/require-admin";
import { snapshotSchema } from "@/lib/documents/snapshots";
import { pdfRenderer } from "@/lib/documents/render-pdf";
export async function renderArchived(
  id: string,
  kind: "invoice" | "proposal" | "receipt",
) {
  const { db } = await requireAdmin();
  const table =
    kind === "invoice"
      ? "invoices"
      : kind === "proposal"
        ? "proposals"
        : "payments";
  const { data: record, error } = await db
    .from(table)
    .select("snapshot,state")
    .eq("id", id)
    .single();
  if (error || !record?.snapshot)
    throw new Error("Issue or confirm the record before rendering.");
  const { data: file, error: fileError } = await db
    .from("document_files")
    .select("*")
    .eq("record_id", id)
    .eq("kind", kind)
    .order("version", { ascending: false })
    .limit(1)
    .single();
  if (fileError) throw new Error("Document metadata is missing");
  if (file.state === "ready") return file.id;
  const admin = privileged();
  let stage = "render";
  try {
    const bytes = await pdfRenderer.render(
      snapshotSchema.parse(record.snapshot),
    );
    const checksum = createHash("sha256").update(bytes).digest("hex");
    const path = `${kind}/${id}/${file.version}-${checksum}.pdf`;
    stage = "upload";
    const upload = await admin.storage
      .from("documents")
      .upload(path, bytes, { contentType: "application/pdf", upsert: false });
    if (
      upload.error &&
      !upload.error.message.toLowerCase().includes("already exists")
    )
      throw new Error("Private storage upload failed");
    stage = "metadata";
    const result = await admin
      .from("document_files")
      .update({ path, checksum, state: "ready", error: null })
      .eq("id", file.id)
      .neq("state", "ready");
    if (result.error) throw new Error("Document metadata update failed");
    return file.id;
  } catch (cause) {
    console.error("Archived PDF failed", {
      documentId: file.id,
      stage,
      error: cause instanceof Error ? cause.message : "Unknown failure",
    });
    const message =
      stage === "upload"
        ? "PDF created, but private storage upload failed. Check the documents bucket and server storage permissions, then retry."
        : stage === "metadata"
          ? "PDF uploaded, but its archive entry could not be saved. Check server database permissions, then retry."
          : cause instanceof Error &&
              cause.message.startsWith("No usable PDF browser")
            ? cause.message
            : "PDF rendering failed. Check the server PDF logs and retry.";
    await admin
      .from("document_files")
      .update({
        state: "failed",
        error: message,
      })
      .eq("id", file.id)
      .neq("state", "ready");
    throw new Error(message + " The issued number and snapshot are preserved.");
  }
}
export async function signedDocument(id: string) {
  const { db } = await requireAdmin();
  const { data: file } = await db
    .from("document_files")
    .select("path,state")
    .eq("id", id)
    .single();
  if (!file?.path || file.state !== "ready")
    throw new Error("PDF is not ready");
  const { data, error } = await db.storage
    .from("documents")
    .createSignedUrl(file.path, 60, { download: true });
  if (error) throw new Error("Download could not be prepared");
  return data.signedUrl;
}
