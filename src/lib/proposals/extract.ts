import "server-only";
export const MAX_SOURCE_BYTES = 4 * 1024 * 1024;
export function validateSourceText(text: string) {
  const clean = text.replace(/\u0000/g, "").trim();
  if (clean.length < 30)
    throw new Error(
      "Not enough readable text was found. For scanned PDFs, paste the text or export a searchable PDF.",
    );
  if (clean.length > 40000)
    throw new Error(
      "The document is too long. Use an excerpt of up to 40,000 characters.",
    );
  return clean;
}
export async function extractSource(file: File) {
  if (!file.size || file.size > MAX_SOURCE_BYTES)
    throw new Error("Choose a non-empty document up to 4 MB.");
  const extension = file.name.split(".").pop()?.toLowerCase();
  const bytes = new Uint8Array(await file.arrayBuffer());
  let text: string;
  if (extension === "txt") {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } else if (extension === "docx") {
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b)
      throw new Error(
        "This file is not a valid Word document. Export it as .docx and try again.",
      );
    const mammoth = await import("mammoth");
    text = (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
  } else if (extension === "pdf") {
    if (new TextDecoder().decode(bytes.subarray(0, 5)) !== "%PDF-")
      throw new Error("This file is not a valid PDF.");
    const { getDocumentProxy } = await import("unpdf");
    const pdf = await getDocumentProxy(bytes);
    try {
      if (pdf.numPages > 60)
        throw new Error("Use a PDF with 60 pages or fewer.");
      const pages: string[] = [];
      let size = 0;
      for (let index = 1; index <= pdf.numPages; index++) {
        const page = await pdf.getPage(index);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((item) =>
            "str" in item ? item.str + (item.hasEOL ? "\n" : " ") : "",
          )
          .join("");
        size += pageText.length;
        if (size > 40000)
          throw new Error(
            "The document is too long. Use an excerpt of up to 40,000 characters.",
          );
        pages.push(pageText);
        page.cleanup();
      }
      text = pages.join("\n\n");
    } finally {
      await pdf.loadingTask.destroy();
    }
  } else {
    throw new Error(
      "Choose a PDF, Word .docx, or UTF-8 .txt file. Save older .doc files as .docx first.",
    );
  }
  return validateSourceText(text);
}
