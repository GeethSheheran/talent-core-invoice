# Proposal drafting

In New proposal, select a company, enter a title and approved investment, then paste project notes or import PDF, Word (.docx), or UTF-8 text. Imports are limited to 4 MB, 40,000 extracted characters and 60 PDF pages. Older .doc files must be saved as .docx. Scanned PDFs need OCR or pasted text; this importer does not perform OCR.

Select Generate proposal with AI. Review the generated sections, extracted terms and warnings, then choose Use this draft and edit. Replacing existing content requires a confirmation. Review draft and save using the existing workflow. Generation never saves, issues, sends or changes the investment automatically.

Set these server-only variables in `.env.local` or your hosting environment and restart/redeploy:

```dotenv
AI_PROVIDER=openai
OPENAI_API_KEY=your_api_key
OPENAI_MODEL=gpt-4.1-mini-2025-04-14
```

`AI_API_KEY` remains a fallback for existing configurations. Never use a `NEXT_PUBLIC_` prefix for the provider key. The model can be overridden with another Responses-compatible model supporting strict structured output. The default is pinned for reproducibility.

The server sends the source text, selected company name, proposal title, approved investment and currency, plus the proposal drafting instructions from Settings, to OpenAI only when Generate is selected. Uploaded documents are parsed in memory; original files are not stored or forwarded. Requests set `store: false`. See the official [Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses) for the response contract. Generation requires an independently verified administrator and same-origin request. Output is validated and rendered as plain text, with no tools or database write capability.

Missing credentials, quota failures, refusals, timeouts and incomplete output leave the current form unchanged. AI can still introduce mistakes in narrative text: review commercial terms, scope and dates before saving. The approved investment field remains the authoritative price.

## API quota and rate-limit failures

HTTP 429 can indicate several different problems. The app reads the provider error code rather than treating every 429 as temporary:

- `credit_balance_exhausted`: add API credits in OpenAI Platform billing.
- `insufficient_quota`: check available credits and project/organization limits.
- Project or organization spend/usage limits: review the corresponding limit before retrying.
- `rate_limit_exceeded` or `slow_down`: wait before retrying; the message includes `Retry-After` when supplied.

Billing failures are not retried automatically. Existing notes and proposal sections remain unchanged. See [OpenAI error codes](https://developers.openai.com/api/docs/guides/error-codes).

## Template fallback and draft PDF

Choose **Create from template** to format the imported or pasted text without an AI request. The template preserves the source text, splits long content into editable sections, and leaves unprovided terms for review. It does not rewrite a report into new promises or infer pricing.

Review the template, then choose **Download draft PDF** for a branded, unnumbered PDF marked DRAFT. This uses the approved investment field and selected company, and does not save, issue, email, or create archive records. Choose **Use this draft and edit** to continue through the existing save and issue workflow.
