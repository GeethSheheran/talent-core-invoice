import { readFile } from "node:fs/promises";
import { afterEach, expect, it, vi } from "vitest";
import { draftProposal } from "../../src/lib/proposals/provider";
import { extractSource } from "../../src/lib/proposals/extract";
import { boundedBody } from "../../src/lib/proposals/request";
const input = {
  source: "Build a company website with a catalogue and contact form.",
  company_id: "10000000-0000-4000-8000-000000000001",
  title: "Website proposal",
  currency: "LKR" as const,
  price: 15000000,
};
const draft = {
  brief: Object.fromEntries(
    [
      "needs",
      "goals",
      "scope",
      "deliverables",
      "exclusions",
      "timeline",
      "payment_schedule",
      "maintenance",
      "future_options",
    ].map((key) => [key, "To be agreed"]),
  ),
  sections: [
    {
      title: "Proposed solution",
      body: "A company website with a catalogue and contact form.",
    },
  ],
  warnings: ["Confirm the delivery timeline."],
};
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("keeps commercial values separate, requests validated output, and disables response storage", async () => {
  vi.stubEnv("AI_PROVIDER", "openai");
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  const fetcher = vi.fn().mockResolvedValue(
    Response.json({
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify(draft) }],
        },
      ],
    }),
  );
  vi.stubGlobal("fetch", fetcher);
  expect(await draftProposal(input, "Example company", "Be concise")).toEqual(
    draft,
  );
  const body = JSON.parse(fetcher.mock.calls[0][1].body);
  expect(body.store).toBe(false);
  expect(body.text.format.strict).toBe(true);
  expect(JSON.parse(body.input).approvedInvestmentMinorUnits).toBe(15000000);
  expect(body.text.format.schema.properties).not.toHaveProperty("price");
});
it("rejects incomplete and invalid AI responses without returning a partial draft", async () => {
  vi.stubEnv("AI_PROVIDER", "openai");
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(Response.json({ status: "incomplete", output: [] })),
  );
  await expect(draftProposal(input, "Company", "")).rejects.toThrow(
    "incomplete",
  );
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      Response.json({
        status: "completed",
        output: [
          {
            type: "message",
            content: [{ type: "output_text", text: '{"sections":[]}' }],
          },
        ],
      }),
    ),
  );
  await expect(draftProposal(input, "Company", "")).rejects.toThrow(
    "validation",
  );
});
it("explains missing setup without calling the AI provider", async () => {
  vi.stubEnv("AI_PROVIDER", "disabled");
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  await expect(draftProposal(input, "Company", "")).rejects.toThrow(
    "not configured",
  );
  expect(fetcher).not.toHaveBeenCalled();
});
it("imports text and rejects fake PDFs, empty files, and unsupported documents", async () => {
  expect(await extractSource(new File([input.source], "brief.txt"))).toBe(
    input.source,
  );
  await expect(
    extractSource(new File([input.source], "brief.pdf")),
  ).rejects.toThrow("valid PDF");
  await expect(extractSource(new File([], "brief.txt"))).rejects.toThrow(
    "non-empty",
  );
  await expect(
    extractSource(new File([input.source], "brief.doc")),
  ).rejects.toThrow(".docx");
});
it("bounds streamed requests without trusting Content-Length", async () => {
  const request = new Request("http://localhost", {
    method: "POST",
    body: "more than four bytes",
  });
  await expect(boundedBody(request, 4)).rejects.toThrow("too large");
});

it("extracts an actual Word document into editable source text", async () => {
  const bytes = await readFile(
    new URL("../fixtures/project-brief.docx", import.meta.url),
  );
  expect(await extractSource(new File([bytes], "brief.docx"))).toBe(
    input.source,
  );
});

it.each([
  ["insufficient_quota", "insufficient_quota", "insufficient API quota"],
  ["credit_balance_exhausted", "insufficient_quota", "credits are exhausted"],
  [
    "project_spend_limit_exceeded",
    "insufficient_quota",
    "project's spending limit",
  ],
  [
    "organization_spend_limit_exceeded",
    "insufficient_quota",
    "organization's spending limit",
  ],
  [
    "organization_usage_limit_exceeded",
    "insufficient_quota",
    "API usage limit",
  ],
])(
  "explains %s without retrying or exposing provider details",
  async (code, type, message) => {
    vi.stubEnv("AI_PROVIDER", "openai");
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        Response.json(
          { error: { code, type, message: "private provider details" } },
          { status: 429 },
        ),
      );
    vi.stubGlobal("fetch", fetcher);
    const error = await draftProposal(input, "Company", "").catch(
      (error) => error as Error,
    );
    if (!(error instanceof Error))
      throw new Error("Expected provider rejection");
    expect(error.message).toContain(message);
    expect(error.message).not.toContain("private provider details");
    expect(error.message).not.toContain("temporarily");
    expect(fetcher).toHaveBeenCalledTimes(1);
  },
);
it("honors temporary rate-limit guidance in the user message", async () => {
  vi.stubEnv("AI_PROVIDER", "openai");
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        Response.json(
          { error: { code: "rate_limit_exceeded", type: "rate_limit_error" } },
          { status: 429, headers: { "retry-after": "25" } },
        ),
      ),
  );
  await expect(draftProposal(input, "Company", "")).rejects.toThrow(
    "Wait at least 25 seconds",
  );
});
it("handles a non-JSON 429 without guessing that credits are exhausted", async () => {
  vi.stubEnv("AI_PROVIDER", "openai");
  vi.stubEnv("OPENAI_API_KEY", "test-key");
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(new Response("<html>Error</html>", { status: 429 })),
  );
  await expect(draftProposal(input, "Company", "")).rejects.toThrow(
    "usage-limit error",
  );
});
