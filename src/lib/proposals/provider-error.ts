import "server-only";
import { z } from "zod";

// Never expose the provider's raw message: it may include submitted text or identifiers.
export async function proposalProviderError(
  response: Response,
): Promise<Error> {
  const parsed = z
    .object({
      error: z.object({
        code: z.string().nullish(),
        type: z.string().nullish(),
      }),
    })
    .safeParse(await response.json().catch(() => null));
  const code = parsed.success ? parsed.data.error.code : null;
  const type = parsed.success ? parsed.data.error.type : null;
  const billing: Record<string, string> = {
    credit_balance_exhausted:
      "OpenAI API credits are exhausted. Add credits in OpenAI Platform billing, then generate again.",
    project_spend_limit_exceeded:
      "This OpenAI project's spending limit has been reached. Review the project's limits in OpenAI Platform before generating again.",
    organization_spend_limit_exceeded:
      "Your OpenAI organization's spending limit has been reached. Review its spending limit in OpenAI Platform before generating again.",
    organization_usage_limit_exceeded:
      "Your OpenAI organization's API usage limit has been reached. Request a higher usage limit through OpenAI Platform.",
    usage_limit_exceeded:
      "OpenAI API usage is unavailable under the current billing or usage limits. Check billing and limits in OpenAI Platform before generating again.",
  };
  if (code && billing[code]) return new Error(billing[code]);
  if (code === "insufficient_quota" || type === "insufficient_quota") {
    return new Error(
      "OpenAI reports insufficient API quota. Check available API credits and project/organization limits in OpenAI Platform. Retrying will not help until the billing or quota issue is resolved. Your project notes are preserved.",
    );
  }
  if (response.status === 429) {
    const temporary =
      code === "rate_limit_exceeded" ||
      code === "slow_down" ||
      type === "rate_limit_error";
    if (!temporary)
      return new Error(
        "OpenAI rejected the request with a usage-limit error. Check API billing and rate limits in OpenAI Platform. Your project notes are preserved.",
      );
    const header = response.headers.get("retry-after");
    const seconds =
      header && /^\d+(\.\d+)?$/.test(header)
        ? Math.ceil(Number(header))
        : header
          ? Math.ceil((Date.parse(header) - Date.now()) / 1000)
          : NaN;
    return new Error(
      Number.isFinite(seconds) && seconds > 0
        ? `OpenAI's temporary rate limit was reached. Wait at least ${seconds} seconds before generating again. Your project notes are preserved.`
        : "OpenAI's temporary rate limit was reached. Wait a moment before generating again; avoid repeated clicks. Your project notes are preserved.",
    );
  }
  if (response.status === 401 || response.status === 403)
    return new Error(
      "The AI provider rejected the server credentials. Check the API key and model access.",
    );
  if (response.status === 503)
    return new Error(
      "The AI service is temporarily overloaded. Try again later. Your project notes are preserved.",
    );
  return new Error(
    "The AI provider could not generate a draft. Check the server model configuration and try again.",
  );
}
