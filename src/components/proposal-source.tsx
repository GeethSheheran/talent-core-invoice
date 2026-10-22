"use client";
import { useRef, useState } from "react";
import { templateProposal } from "@/lib/proposals/template";
import { minor } from "@/lib/billing/money";
import {
  proposalDraft,
  type ProposalDraft,
} from "@/lib/proposals/draft-schema";
export function ProposalSource({
  onApply,
  onManual,
}: {
  onApply: (draft: ProposalDraft) => boolean;
  onManual: () => void;
}) {
  const root = useRef<HTMLElement>(null);
  const [source, setSource] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [candidate, setCandidate] = useState<ProposalDraft | null>(null);
  const [draftMode, setDraftMode] = useState<"ai" | "template">("ai");
  const [imported, setImported] = useState("");
  return (
    <section className="proposal-source" ref={root}>
      <div className="eyebrow">1 · Project content</div>
      <h2>Start with your project brief</h2>
      <p>
        Paste your notes or import a document. Use a template, or let AI write a
        draft for you.
      </p>
      <label htmlFor="proposal-upload">Import a document</label>
      <input
        id="proposal-upload"
        type="file"
        accept=".pdf,.docx,.txt"
        disabled={Boolean(busy)}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (
            source.trim() &&
            !window.confirm(
              "Replace the current source text with this document? Your proposal sections will stay unchanged.",
            )
          )
            return;
          if (file.size > 4 * 1024 * 1024) {
            setError("Choose a document up to 4 MB.");
            return;
          }
          setBusy("Reading document…");
          setError("");
          try {
            const body = new FormData();
            body.set("file", file);
            const response = await fetch("/api/proposals/import", {
              method: "POST",
              body,
            });
            const result = await response.json();
            if (!response.ok)
              throw new Error(
                result.error || "The document could not be read.",
              );
            setSource(result.text);
            setImported(file.name);
            setCandidate(null);
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Import failed.");
          } finally {
            setBusy("");
          }
        }}
      />
      <p className="muted">
        PDF, Word (.docx), or text · Up to 4 MB. Save older .doc files as .docx
        first. Scanned PDFs need readable text.
      </p>
      <label htmlFor="proposal-source">
        Project notes {imported && `· Imported from ${imported}`}
      </label>
      <textarea
        id="proposal-source"
        value={source}
        maxLength={40000}
        disabled={Boolean(busy)}
        placeholder="Describe the company’s needs, proposed work, deliverables, timeline, and agreed terms…"
        onChange={(e) => {
          setSource(e.target.value);
          setCandidate(null);
        }}
      />
      <p className="muted">
        {source.length.toLocaleString()} / 40,000 characters. Templates work
        without AI. Only AI generation sends your text and proposal details to
        OpenAI.
      </p>
      <div className="actions">
        <button
          type="button"
          disabled={Boolean(busy) || source.trim().length < 30}
          onClick={async () => {
            const form = root.current?.closest("form");
            if (!form) return;
            setError("");
            setBusy("Writing your proposal…");
            try {
              const fields = new FormData(form);
              if (!fields.get("company_id") || !fields.get("title"))
                throw new Error(
                  "Choose a company and enter a proposal title first.",
                );
              const response = await fetch("/api/proposals/draft", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  source,
                  company_id: fields.get("company_id"),
                  title: fields.get("title"),
                  currency: fields.get("currency"),
                  price: minor(String(fields.get("price") || "0")),
                }),
              });
              const result = await response.json();
              if (!response.ok)
                throw new Error(result.error || "Drafting failed.");
              setCandidate(proposalDraft.parse(result));
              setDraftMode("ai");
            } catch (cause) {
              setError(
                cause instanceof Error ? cause.message : "Drafting failed.",
              );
            } finally {
              setBusy("");
            }
          }}
        >
          Generate proposal with AI
        </button>
        <button
          type="button"
          className="secondary"
          disabled={Boolean(busy) || source.trim().length < 30}
          onClick={() => {
            try {
              setCandidate(templateProposal(source));
              setDraftMode("template");
              setError("");
            } catch (cause) {
              setError(
                cause instanceof Error
                  ? cause.message
                  : "Check the project notes.",
              );
            }
          }}
        >
          Create from template
        </button>
        <button
          type="button"
          className="secondary"
          disabled={Boolean(busy)}
          onClick={onManual}
        >
          Write manually
        </button>
      </div>
      {busy && <p role="status">{busy}</p>}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {candidate && (
        <section
          className="proposal-candidate"
          aria-label="Generated proposal preview"
        >
          <div className="eyebrow">
            2 · Review the {draftMode === "ai" ? "AI" : "template"} draft
          </div>
          <h3>Your proposal draft</h3>
          <p>
            Check scope, dates, and commitments before using this draft. Your
            current proposal has not changed.
          </p>
          {candidate.warnings.length > 0 && (
            <div className="notice">
              <strong>Details to review</strong>
              <ul>
                {candidate.warnings.map((warning, i) => (
                  <li key={i}>{warning}</li>
                ))}
              </ul>
            </div>
          )}
          {candidate.sections.map((section, i) => (
            <div className="proposal-section" key={i}>
              <h3>{section.title}</h3>
              <p style={{ whiteSpace: "pre-wrap" }}>{section.body}</p>
            </div>
          ))}
          <details>
            <summary>Review extracted project terms</summary>
            <dl>
              {Object.entries(candidate.brief).map(([key, value]) => (
                <div key={key}>
                  <dt>{key.replaceAll("_", " ")}</dt>
                  <dd>{value || "Not supplied"}</dd>
                </div>
              ))}
            </dl>
          </details>
          <p className="muted">
            Download a draft PDF for review, or use this draft to edit and save
            it. Official numbering is assigned only when you issue the saved
            proposal.
          </p>
          <div className="actions">
            <button
              type="button"
              className="secondary"
              disabled={Boolean(busy)}
              onClick={async () => {
                const form = root.current?.closest("form");
                if (!form) return;
                setError("");
                setBusy("Preparing draft PDF…");
                try {
                  const fields = new FormData(form);
                  if (!fields.get("company_id") || !fields.get("title"))
                    throw new Error(
                      "Choose a company and enter a proposal title first.",
                    );
                  const response = await fetch("/api/proposals/draft-pdf", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      company_id: fields.get("company_id"),
                      title: fields.get("title"),
                      currency: fields.get("currency"),
                      price: minor(String(fields.get("price") || "0")),
                      brief: candidate.brief,
                      sections: candidate.sections,
                    }),
                  });
                  if (!response.ok) {
                    const result = await response.json();
                    throw new Error(result.error || "Unable to generate PDF.");
                  }
                  const url = URL.createObjectURL(await response.blob());
                  const link = document.createElement("a");
                  link.href = url;
                  link.download = "proposal-draft.pdf";
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  window.setTimeout(() => URL.revokeObjectURL(url), 60000);
                } catch (cause) {
                  setError(
                    cause instanceof Error
                      ? cause.message
                      : "Unable to generate PDF.",
                  );
                } finally {
                  setBusy("");
                }
              }}
            >
              Download draft PDF
            </button>
            <button
              type="button"
              disabled={Boolean(busy)}
              onClick={() => {
                if (onApply(candidate)) setCandidate(null);
              }}
            >
              Use this draft and edit
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setCandidate(null)}
            >
              Discard draft
            </button>
          </div>
        </section>
      )}
    </section>
  );
}
