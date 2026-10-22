module.exports = [
"[project]/src/lib/env.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "appUrl",
    ()=>appUrl,
    "configured",
    ()=>configured,
    "productionJobs",
    ()=>productionJobs,
    "publicEnv",
    ()=>publicEnv,
    "validateRuntimeEnvironment",
    ()=>validateRuntimeEnvironment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z .object>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$url$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z .url>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z .string>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [instrumentation] (ecmascript) <export * as z .enum>");
;
;
function configured() {
    return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}
function publicEnv() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
        url: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$url$3e$__["z"].url(),
        key: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().min(10)
    }).parse({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    });
}
function productionJobs() {
    return process.env.VERCEL_ENV === "production" && process.env.ENABLE_PRODUCTION_JOBS === "true";
}
function appUrl() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$url$3e$__["z"].url().parse(process.env.APP_URL || "http://localhost:3000");
}
function validateRuntimeEnvironment() {
    // An entirely unconfigured checkout serves the setup page. Partial
    // configurations fail explicitly without including values in the error.
    const hasConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
    if (!hasConfig) return;
    const result = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
        NEXT_PUBLIC_SUPABASE_URL: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$url$3e$__["z"].url(),
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().min(10),
        SUPABASE_SECRET_KEY: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().min(10),
        EMAIL_PROVIDER: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__["z"].enum([
            "mock",
            "resend"
        ]).default("mock"),
        AI_PROVIDER: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$instrumentation$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__["z"].enum([
            "disabled",
            "openai"
        ]).default("disabled")
    }).safeParse(process.env);
    if (!result.success) {
        throw new Error("Invalid configuration: " + result.error.issues.map((i)=>i.path.join(".")).join(", "));
    }
    appUrl();
    if (result.data.EMAIL_PROVIDER === "resend" && (!process.env.EMAIL_API_KEY || !process.env.EMAIL_FROM)) {
        throw new Error("Resend requires EMAIL_API_KEY and EMAIL_FROM");
    }
    if (productionJobs() && (!process.env.CRON_SECRET || !process.env.ADMIN_NOTIFICATION_EMAIL)) {
        throw new Error("Production jobs require CRON_SECRET and ADMIN_NOTIFICATION_EMAIL");
    }
}
}),
];

//# sourceMappingURL=src_lib_env_ts_2165k83csqcsp._.js.map