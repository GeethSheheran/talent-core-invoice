# Email and reliable delivery

EMAIL_PROVIDER=mock is the default and records mock, never accepted/delivered. Queue an issued invoice only after its private archived PDF is ready. Notifications → Process pending jobs processes bounded batches. Production cron also processes at most 10 jobs per invocation. Leases, attempt counters and exponential backoff prevent simultaneous workers from claiming the same pending job; a lease expires after five minutes. Jobs stop after five attempts and require operator review.

The Resend adapter implements EmailProvider. Configure EMAIL_API_KEY, EMAIL_FROM and a verified sender domain in Resend. Configure SPF/DKIM and verify actual delivery to an administrator-controlled address before enabling production. ADMIN_NOTIFICATION_EMAIL receives reminder emails. Outside explicitly enabled production, all Resend sends are redirected to DEV_EMAIL_RECIPIENT with a development subject prefix; the business delivery attempt is still recorded as mock, so client reminder timing does not start.

Register `/api/webhooks/email` with Resend; set EMAIL_WEBHOOK_SECRET. The handler verifies the raw body and Svix headers via the provider SDK, then matches provider email IDs. No signature secret means the webhook remains disabled. Acceptance, delivery and failure are separate. Acceptance is not evidence of reading. An external send mark captures WhatsApp/email/other and starts scheduling explicitly.

Use stable idempotency keys for retries. Resend's idempotency window is finite (24 hours); ambiguous invoice attempts older than 23 hours are not automatically resent. Reconcile the provider event/history before manually requeuing or changing any key. Network acceptance followed by a lost application response can otherwise duplicate delivery. Do not reset first-send date on a retry.

Daily interval scans are calendar-based and administrator-only. They do not automatically email client reminders. Paid, paused and void invoices are checked again at send time. No production emails or webhooks were exercised during implementation.

References: [Resend send API](https://resend.com/docs/api-reference/emails/send-email), [idempotency](https://resend.com/docs/dashboard/emails/idempotency-keys), [webhook verification](https://resend.com/docs/dashboard/webhooks/verify-webhooks-requests).
