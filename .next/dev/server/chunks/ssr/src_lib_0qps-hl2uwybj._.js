(()=>{"use strict";module.exports = [
"[project]/src/lib/email/provider.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "MockEmailProvider",
    ()=>MockEmailProvider,
    "ResendEmailProvider",
    ()=>ResendEmailProvider,
    "emailProvider",
    ()=>emailProvider
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/resend/dist/index.mjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-rsc] (ecmascript)");
;
;
;
class MockEmailProvider {
    async send(_message) {
        void _message;
        return {
            state: "mock",
            id: null
        };
    }
}
class ResendEmailProvider {
    async send(message) {
        const key = process.env.EMAIL_API_KEY;
        const from = process.env.EMAIL_FROM;
        if (!key || !from) throw new Error("Email provider configuration is incomplete");
        const to = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["productionJobs"])() ? message.to : process.env.DEV_EMAIL_RECIPIENT;
        if (!to) throw new Error("Nonproduction email needs a development recipient");
        const client = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$resend$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Resend"](key);
        const result = await client.emails.send({
            from,
            to,
            subject: ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["productionJobs"])() ? "" : "[DEVELOPMENT] ") + message.subject,
            text: message.text,
            attachments: message.attachment ? [
                message.attachment
            ] : undefined
        }, {
            idempotencyKey: message.key
        });
        if (result.error || !result.data) throw new Error("Email provider request failed");
        return {
            state: "accepted",
            id: result.data.id
        };
    }
}
function emailProvider() {
    return process.env.EMAIL_PROVIDER === "resend" ? new ResendEmailProvider() : new MockEmailProvider();
}
}),
"[project]/src/lib/notifications/outbox.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "processOutbox",
    ()=>processOutbox
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$privileged$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/privileged.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2f$provider$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/email/provider.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .object>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .uuid>");
;
;
;
;
;
async function processOutbox() {
    const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$privileged$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["privileged"])();
    const { data: jobs, error } = await db.rpc("claim_jobs", {
        p_limit: 10
    });
    if (error) throw new Error("Could not claim jobs");
    let completed = 0;
    for (const job of jobs || []){
        try {
            if (job.attempts > 1 && Date.now() - new Date(job.created_at).getTime() > 23 * 60 * 60 * 1000) throw new Error("Provider idempotency window expired; reconcile before retry");
            if (job.kind === "invoice_email") {
                const payload = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
                    attempt_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__["z"].uuid()
                }).parse(job.payload);
                const { data: attempt } = await db.from("delivery_attempts").select("*").eq("id", payload.attempt_id).single();
                if (!attempt) throw new Error("Delivery attempt missing");
                if (![
                    "accepted",
                    "delivered",
                    "external"
                ].includes(attempt.state)) {
                    // Resend deduplicates for 24h; never blindly retry an ambiguous acceptance later.
                    if (job.attempts > 1 && Date.now() - new Date(job.created_at).getTime() > 23 * 60 * 60 * 1000) throw new Error("Acceptance ambiguous: reconcile with provider before retry");
                    const { data: invoice } = await db.from("invoices").select("state,number").eq("id", attempt.invoice_id).single();
                    if (invoice?.state !== "issued") throw new Error("Invoice is no longer issued");
                    const { data: file } = await db.from("document_files").select("path").eq("record_id", attempt.invoice_id).eq("kind", "invoice").eq("state", "ready").single();
                    if (!file?.path) throw new Error("Archived PDF is missing");
                    const { data: blob, error: downloadError } = await db.storage.from("documents").download(file.path);
                    if (downloadError || !blob) throw new Error("Private PDF download failed");
                    const sent = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2f$provider$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailProvider"])().send({
                        to: attempt.recipient,
                        subject: "Invoice " + invoice.number,
                        text: "Please find your invoice attached. Contact us if you have any questions.",
                        key: attempt.idempotency_key,
                        attachment: {
                            filename: invoice.number + ".pdf",
                            content: Buffer.from(await blob.arrayBuffer())
                        }
                    });
                    const result = await db.rpc("record_delivery", {
                        p_attempt: attempt.id,
                        p_state: sent.state === "accepted" && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["productionJobs"])() ? "mock" : sent.state,
                        p_provider: sent.id
                    });
                    if (result.error) throw new Error("Delivery result could not be committed");
                }
            } else if (job.kind === "admin_reminder") {
                const payload = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
                    invoice_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__["z"].uuid()
                }).parse(job.payload);
                const { data: i } = await db.from("invoice_balances").select("*").eq("id", payload.invoice_id).single();
                if (i?.state === "issued" && !i.reminders_paused && Number(i.outstanding) > 0) {
                    const to = process.env.ADMIN_NOTIFICATION_EMAIL;
                    if (!to) throw new Error("Administrator notification email missing");
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$email$2f$provider$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["emailProvider"])().send({
                        to,
                        subject: "Follow up: " + i.number,
                        text: "An invoice still has an outstanding balance. Review it in the billing workspace.",
                        key: job.key
                    });
                }
            } else throw new Error("Unknown job type");
            const done = await db.from("outbox_jobs").update({
                state: "done",
                lease_until: null,
                last_error: null
            }).eq("id", job.id).eq("attempts", job.attempts);
            if (done.error) throw new Error("Job completion could not be saved");
            completed++;
        } catch  {
            if (job.kind === "invoice_email") {
                const parsed = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
                    attempt_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__["z"].uuid()
                }).safeParse(job.payload);
                if (parsed.success) await db.from("delivery_attempts").update({
                    state: "failed"
                }).eq("id", parsed.data.attempt_id).not("state", "in", "(accepted,delivered,external)");
            }
            await db.from("outbox_jobs").update({
                state: job.attempts >= 5 ? "failed" : "pending",
                lease_until: null,
                last_error: "Job failed; inspect configuration or provider acceptance before retry.",
                available_at: new Date(Date.now() + Math.min(60, 2 ** job.attempts) * 60000).toISOString()
            }).eq("id", job.id).eq("attempts", job.attempts);
        }
    }
    return {
        claimed: jobs?.length || 0,
        completed
    };
}
}),
"[project]/src/lib/supabase/privileged.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "privileged",
    ()=>privileged
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-rsc] (ecmascript)");
;
;
;
function privileged() {
    const key = process.env.SUPABASE_SECRET_KEY;
    if (!key) throw new Error("Server Supabase key is not configured");
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["publicEnv"])().url, key, {
        auth: {
            persistSession: false,
            autoRefreshToken: false
        }
    });
}
}),
];})()

//# sourceMappingURL=src_lib_0qps-hl2uwybj._.js.map