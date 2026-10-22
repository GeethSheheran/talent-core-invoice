import { expect, it } from "vitest";
import { templateProposal } from "../../src/lib/proposals/template";
import { proposalDraft } from "../../src/lib/proposals/draft-schema";
it("creates a valid template without inventing project terms", () => {
  const source =
    "The company needs a new catalogue website and contact form. Delivery dates are still under discussion.";
  const draft = templateProposal(source);
  expect(proposalDraft.safeParse(draft).success).toBe(true);
  expect(draft.sections[1].body).toBe(source);
  expect(draft.brief.timeline).toBe("");
  expect(draft.brief.payment_schedule).toContain("To be agreed");
});
it("keeps a full-length imported document within section limits without truncation", () => {
  const source = "Catalogue requirements and delivery notes. "
    .repeat(900)
    .trim();
  const draft = templateProposal(source);
  expect(draft.sections.every((section) => section.body.length <= 4000)).toBe(
    true,
  );
  expect(
    draft.sections
      .slice(1, -1)
      .map((section) => section.body)
      .join(" "),
  ).toBe(source);
});
it("handles long unbroken text and rejects an oversized source", () => {
  expect(
    templateProposal("x".repeat(40000))
      .sections.slice(1, -1)
      .map((section) => section.body)
      .join(""),
  ).toHaveLength(40000);
  expect(() => templateProposal("x".repeat(40001))).toThrow("40,000");
});
