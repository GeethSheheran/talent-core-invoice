import { proposalDraft, type ProposalDraft } from "./draft-schema";
export function templateProposal(source: string): ProposalDraft {
  let remaining = source.trim();
  if (remaining.length < 30)
    throw new Error("Add at least 30 characters of project context.");
  if (remaining.length > 40000)
    throw new Error("Use up to 40,000 characters of project context.");
  const sections: ProposalDraft["sections"] = [
    {
      title: "Introduction",
      body: "This proposal sets out the supplied project brief for review. Confirm the scope, delivery schedule, and commercial terms before accepting the proposal.",
    },
  ];
  let part = 1;
  while (remaining) {
    let end = Math.min(3500, remaining.length);
    if (end < remaining.length) {
      const breakAt = Math.max(
        remaining.lastIndexOf("\n", end),
        remaining.lastIndexOf(" ", end),
      );
      if (breakAt > 3000) end = breakAt;
    }
    sections.push({
      title: part === 1 ? "Project brief" : `Project brief · continued ${part}`,
      body: remaining.slice(0, end).trim(),
    });
    remaining = remaining.slice(end).trim();
    part++;
  }
  sections.push({
    title: "Acceptance and next steps",
    body: "Review the project brief and investment below. Confirm the final deliverables, timeline, payment schedule, and any exclusions with both parties before work begins.",
  });
  return proposalDraft.parse({
    sections,
    brief: {
      needs: "",
      goals: "",
      scope: "",
      deliverables: "",
      exclusions: "",
      timeline: "",
      payment_schedule: "To be agreed before acceptance.",
      maintenance: "",
      future_options: "",
    },
    warnings: [
      "Created from a template without AI. The supplied text is preserved, not rewritten or verified.",
      "Review the source content and replace any report-only wording. Confirm scope, dates and payment terms before sharing.",
    ],
  });
}
