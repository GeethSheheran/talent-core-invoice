module.exports = [
(()=>{"use strict";return[
"[project]/.next-internal/server/app/(admin)/[collection]/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/(auth)/login/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/(admin)/notification-actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/app/(admin)/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "00735f55294aee365770bac920407bca0c7e1bf818",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$notification$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getNotificationPreview"],
    "00b90399fe9a532a3e5f3fa5f6197ac99dd4ed5651",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["runPendingJobs"],
    "00bcd4ca224f1b825a546d7c69ab14070e0669be66",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$login$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["signOut"],
    "60203bacae8e46f17aeb35088e0ade55283beb79e3",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveRecord"],
    "604008f99fde93da762a5532f5d1e802a3e7dd9e7d",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveReminderRule"],
    "60695ba6670ce302441f82085172217e87150daefb",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["financialAction"],
    "60833e02ea3946c5d327eab2919c7b1e782678e227",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveBrand"],
    "60ba72932296c9c928bde555803fe49501b42646f2",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["saveCompanyRecord"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$admin$292f5b$collection$5d2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f28$auth$292f$login$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f28$admin$292f$notification$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE2__$3d3e$__$225b$project$5d2f$src$2f$app$2f28$admin$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(admin)/[collection]/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/(auth)/login/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/app/(admin)/notification-actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE2 => "[project]/src/app/(admin)/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$login$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(auth)/login/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$notification$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(admin)/notification-actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(admin)/actions.ts [app-rsc] (ecmascript)");
}),
"[project]/.next-internal/server/app/(admin)/[collection]/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/(auth)/login/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/(admin)/notification-actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE2 => \"[project]/src/app/(admin)/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$login$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(auth)/login/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$notification$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(admin)/notification-actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(admin)/actions.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
}),
"[project]/config/brand.schema.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "brandSchema",
    ()=>brandSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .string>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .object>");
;
const asset = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().regex(/^\/brand\/[a-zA-Z0-9_\-/]+\.(png|jpg|jpeg|woff2|ttf)$/).refine((v)=>!v.includes(".."));
const brandSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    version: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().min(1).max(80),
    name: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().min(1).max(80),
    primary: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().regex(/^#[0-9a-fA-F]{6}$/),
    accent: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().regex(/^#[0-9a-fA-F]{6}$/),
    ink: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().regex(/^#[0-9a-fA-F]{6}$/),
    logo: asset.nullable(),
    font: asset.nullable(),
    documentTitle: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().max(100)
});
}),
"[project]/src/app/(admin)/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00b90399fe9a532a3e5f3fa5f6197ac99dd4ed5651":{"name":"runPendingJobs"},"60203bacae8e46f17aeb35088e0ade55283beb79e3":{"name":"saveRecord"},"604008f99fde93da762a5532f5d1e802a3e7dd9e7d":{"name":"saveReminderRule"},"60695ba6670ce302441f82085172217e87150daefb":{"name":"financialAction"},"60833e02ea3946c5d327eab2919c7b1e782678e227":{"name":"saveBrand"},"60ba72932296c9c928bde555803fe49501b42646f2":{"name":"saveCompanyRecord"}},"src/app/(admin)/actions.ts",""] */ __turbopack_context__.s([
    "financialAction",
    ()=>financialAction,
    "runPendingJobs",
    ()=>runPendingJobs,
    "saveBrand",
    ()=>saveBrand,
    "saveCompanyRecord",
    ()=>saveCompanyRecord,
    "saveRecord",
    ()=>saveRecord,
    "saveReminderRule",
    ()=>saveReminderRule
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/require-admin.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/validation/schemas.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$documents$2f$brand$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/documents/brand.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .enum>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .uuid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$ZodError$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .ZodError>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .string>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$iso$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .iso>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$coerce$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .coerce>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$array$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .array>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .object>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$number$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .number>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
const paths = {
    expense: "expenses",
    company: "companies",
    service: "services",
    project: "projects",
    agreement: "agreements",
    invoice: "invoices",
    payment: "payments",
    proposal: "proposals",
    settings: "settings"
};
async function persistRecord(form, companyId) {
    const { db } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
    const kind = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__["z"].enum([
        "expense",
        "company",
        "service",
        "project",
        "agreement",
        "invoice",
        "payment",
        "proposal",
        "settings"
    ]).parse(form.get("kind"));
    let id = null;
    try {
        const raw = JSON.parse(String(form.get("payload")));
        const data = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["schemas"][kind].parse(raw);
        if (companyId && (!("company_id" in data) || data.company_id !== companyId)) return {
            error: "The record must belong to this company."
        };
        const supplied = form.get("id");
        id = supplied ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__["z"].uuid().parse(supplied) : null;
        const result = await db.rpc("save_record", {
            p_kind: kind,
            p_id: id,
            p_data: data
        });
        if (result.error) return {
            error: result.error.message
        };
        id = result.data;
    } catch (error) {
        return {
            error: error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$ZodError$3e$__["z"].ZodError ? error.issues.map((i)=>i.path.join(".") + ": " + i.message).join("; ") : "Invalid form data."
        };
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/", "layout");
    return {
        id: id,
        kind
    };
}
async function saveCompanyRecord(companyId, form) {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
    const company = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__["z"].uuid().parse(companyId);
    // Company dialogs only create records; editing cannot be redirected to another owner.
    if (form.get("id")) return {
        error: "Use the record editor to edit an existing record."
    };
    return persistRecord(form, company);
}
async function saveRecord(_, form) {
    const result = await persistRecord(form);
    if ("error" in result) return result.error || "Unable to save.";
    const { kind, id } = result;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/" + paths[kind] + (kind === "settings" || kind === "service" ? "" : "/" + id));
}
async function financialAction(_, form) {
    const { db } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
    const action = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().parse(form.get("action"));
    const id = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__["z"].uuid().parse(form.get("id"));
    try {
        let error = null;
        if (action === "attach_pending_expenses") {
            const expenses = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$array$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
                id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__["z"].uuid(),
                amount: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$number$3e$__["z"].number().int().positive().max(1e12)
            })).min(1).max(300).parse(JSON.parse(String(form.get("expenses"))));
            ({ error } = await db.rpc("attach_pending_expenses", {
                p_invoice: id,
                p_expenses: expenses
            }));
            if (error && "code" in error && error.code === "PGRST202") return "Expense attachment needs the latest database update. Your draft has not changed.";
        } else if (action === "issue_invoice") ({ error } = await db.rpc("issue_invoice", {
            p_id: id,
            p_brand: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$documents$2f$brand$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["brandSnapshot"])()
        }));
        else if (action === "issue_proposal") ({ error } = await db.rpc("issue_proposal", {
            p_id: id,
            p_brand: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$documents$2f$brand$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["brandSnapshot"])()
        }));
        else if (action === "accept_proposal") ({ error } = await db.rpc("accept_proposal", {
            p_id: id
        }));
        else if (action === "confirm_payment") ({ error } = await db.rpc("confirm_payment", {
            p_id: id,
            p_allocations: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allocationsSchema"].parse(JSON.parse(String(form.get("allocations")))),
            p_brand: await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$documents$2f$brand$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["brandSnapshot"])()
        }));
        else if (action === "allocate_credit") ({ error } = await db.rpc("allocate_credit", {
            p_id: id,
            p_allocations: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$validation$2f$schemas$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allocationsSchema"].parse(JSON.parse(String(form.get("allocations")))),
            p_key: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__["z"].uuid().parse(form.get("key"))
        }));
        else if (action === "reverse_payment") ({ error } = await db.rpc("reverse_payment", {
            p_id: id,
            p_reason: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().min(5).max(1000).parse(form.get("reason"))
        }));
        else if (action === "void_invoice") ({ error } = await db.rpc("void_invoice", {
            p_id: id,
            p_reason: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().min(5).max(1000).parse(form.get("reason"))
        }));
        else if (action === "apply_credit") ({ error } = await db.rpc("apply_credit", {
            p_invoice: id,
            p_amount: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$coerce$3e$__["z"].coerce.number().int().positive().max(1e12).parse(form.get("amount")),
            p_reason: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().min(5).max(1000).parse(form.get("reason")),
            p_key: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__["z"].uuid().parse(form.get("key"))
        }));
        else if (action === "mark_external") ({ error } = await db.rpc("mark_external", {
            p_id: id,
            p_channel: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__["z"].enum([
                "WhatsApp",
                "email",
                "other"
            ]).parse(form.get("channel"))
        }));
        else if (action === "pause_reminders") ({ error } = await db.rpc("pause_reminders", {
            p_id: id,
            p_pause: form.get("pause") === "true"
        }));
        else if (action === "monthly_draft") ({ error } = await db.rpc("generate_monthly_draft", {
            p_agreement: id,
            p_period: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$iso$3e$__["z"].iso.date().parse(form.get("period"))
        }));
        else if (action === "send_invoice") ({ error } = await db.rpc("queue_invoice_email", {
            p_id: id
        }));
        else return "Unknown action";
        if (error) return error.message;
    } catch  {
        return "Check the values and try again.";
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/", "layout");
    return "Saved successfully.";
}
async function saveReminderRule(_, form) {
    const { db } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
    try {
        const intervals = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$array$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$number$3e$__["z"].number().int().min(1).max(365)).min(1).max(12).parse(String(form.get("intervals")).split(",").map(Number));
        const basis = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__["z"].enum([
            "sent",
            "due"
        ]).parse(form.get("basis"));
        const repeat = String(form.get("repeat") || "");
        const { error } = await db.rpc("save_reminder_rule", {
            p_intervals: intervals,
            p_basis: basis,
            p_repeat: repeat ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$coerce$3e$__["z"].coerce.number().int().min(1).max(365).parse(repeat) : null
        });
        if (error) return error.message;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/settings");
        return "Rule saved. It applies to dates from tomorrow; no backlog burst.";
    } catch  {
        return "Use comma-separated day intervals between 1 and 365.";
    }
}
async function saveBrand(_, form) {
    const { db } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
    try {
        const { brandSchema } = await __turbopack_context__.A("[project]/config/brand.schema.ts [app-rsc] (ecmascript, async loader)");
        const brand = brandSchema.parse(JSON.parse(String(form.get("brand"))));
        const { data } = await db.from("settings").select("data").eq("id", "business").single();
        const current = data?.data;
        if (!current || typeof current !== "object" || Array.isArray(current)) return "Business settings are missing";
        const { error } = await db.rpc("save_record", {
            p_kind: "settings",
            p_id: null,
            p_data: {
                ...current,
                brand
            }
        });
        if (error) return error.message;
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/settings");
        return "Brand saved for new documents.";
    } catch  {
        return "Check colors and local asset paths.";
    }
}
async function runPendingJobs() {
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
    const { processOutbox } = await __turbopack_context__.A("[project]/src/lib/notifications/outbox.ts [app-rsc] (ecmascript, async loader)");
    await processOutbox();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/notifications");
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    saveCompanyRecord,
    saveRecord,
    financialAction,
    saveReminderRule,
    saveBrand,
    runPendingJobs
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveCompanyRecord, "60ba72932296c9c928bde555803fe49501b42646f2", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveRecord, "60203bacae8e46f17aeb35088e0ade55283beb79e3", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(financialAction, "60695ba6670ce302441f82085172217e87150daefb", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveReminderRule, "604008f99fde93da762a5532f5d1e802a3e7dd9e7d", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(saveBrand, "60833e02ea3946c5d327eab2919c7b1e782678e227", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(runPendingJobs, "00b90399fe9a532a3e5f3fa5f6197ac99dd4ed5651", null);
}),
"[project]/src/app/(admin)/notification-actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00735f55294aee365770bac920407bca0c7e1bf818":{"name":"getNotificationPreview"}},"src/app/(admin)/notification-actions.ts",""] */ __turbopack_context__.s([
    "getNotificationPreview",
    ()=>getNotificationPreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notifications$2f$preview$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/notifications/preview.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
async function getNotificationPreview() {
    // The loader independently verifies administrator access on every request.
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notifications$2f$preview$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["loadNotificationPreview"])();
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    getNotificationPreview
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getNotificationPreview, "00735f55294aee365770bac920407bca0c7e1bf818", null);
}),
"[project]/src/app/(auth)/login/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00bcd4ca224f1b825a546d7c69ab14070e0669be66":{"name":"signOut"},"6000e143c54718ca43732ebdd1cb5cf53df25e5dff":{"name":"recover"},"6031b7689d93a0e5d3f0457c656dfc4714e7f9508c":{"name":"login"},"605add4bb53ed42fe3a88f18c406ba6c5289c49400":{"name":"resetPassword"}},"src/app/(auth)/login/actions.ts",""] */ __turbopack_context__.s([
    "login",
    ()=>login,
    "recover",
    ()=>recover,
    "resetPassword",
    ()=>resetPassword,
    "signOut",
    ()=>signOut
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/supabase/server.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/env.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/require-admin.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .object>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$email$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .email>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .string>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function login(_, form) {
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["configured"])()) return "Complete Supabase setup first.";
    const input = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
        email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$email$3e$__["z"].email(),
        password: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().min(8)
    }).safeParse(Object.fromEntries(form));
    if (!input.success) return "Enter a valid email and password.";
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serverClient"])();
    const { error } = await db.auth.signInWithPassword(input.data);
    if (error) return "Sign-in failed. Check your email and password.";
    try {
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
    } catch  {
        await db.auth.signOut();
        return "This account is not an approved administrator.";
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/dashboard");
}
async function signOut() {
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serverClient"])();
    await db.auth.signOut();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
}
async function recover(_, form) {
    const email = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$email$3e$__["z"].email().safeParse(form.get("email"));
    if (!email.success) return "Enter a valid email address.";
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["configured"])()) return "Complete Supabase setup first.";
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serverClient"])();
    await db.auth.resetPasswordForEmail(email.data, {
        redirectTo: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$env$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["appUrl"])() + "/auth/callback?next=/reset-password"
    });
    return "If the account is eligible, a recovery email will arrive shortly.";
}
async function resetPassword(_, form) {
    const password = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().min(12).max(200).safeParse(form.get("password"));
    if (!password.success) return "Use at least 12 characters.";
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$supabase$2f$server$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["serverClient"])();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return "Open the recovery link from your email first.";
    const { error } = await db.auth.updateUser({
        password: password.data
    });
    if (error) return "Password could not be updated. Request a new recovery link.";
    await db.auth.signOut();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["redirect"])("/login");
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    login,
    signOut,
    recover,
    resetPassword
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(login, "6031b7689d93a0e5d3f0457c656dfc4714e7f9508c", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(signOut, "00bcd4ca224f1b825a546d7c69ab14070e0669be66", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(recover, "6000e143c54718ca43732ebdd1cb5cf53df25e5dff", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(resetPassword, "605add4bb53ed42fe3a88f18c406ba6c5289c49400", null);
}),
"[project]/src/lib/billing/money.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "currencies",
    ()=>currencies,
    "formatMoney",
    ()=>formatMoney,
    "major",
    ()=>major,
    "minor",
    ()=>minor
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$decimal$2e$js$2f$decimal$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/decimal.js/decimal.mjs [app-rsc] (ecmascript)");
;
const currencies = [
    "LKR",
    "USD",
    "EUR",
    "GBP",
    "AUD",
    "INR"
];
function minor(value) {
    const d = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$decimal$2e$js$2f$decimal$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](value).mul(100);
    if (!d.isInteger() || d.abs().gt(1_000_000_000_000)) throw new Error("Use at most two decimal places and an amount below 10 billion.");
    return d.toNumber();
}
function formatMoney(amount, currency = "LKR") {
    return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency
    }).format(amount / 100);
}
function major(amount) {
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$decimal$2e$js$2f$decimal$2e$mjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"](amount).div(100).toFixed(2);
}
}),
"[project]/src/lib/documents/brand.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "brandSnapshot",
    ()=>brandSnapshot
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/require-admin.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:fs/promises [external] (node:fs/promises, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/node:path [external] (node:path, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$brand$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/brand.json.[json].cjs [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$brand$2e$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/brand.schema.ts [app-rsc] (ecmascript)");
;
;
;
;
;
;
async function brandSnapshot() {
    const { db } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
    const { data: settings } = await db.from("settings").select("data").eq("id", "business").single();
    const data = settings?.data;
    const custom = data && typeof data === "object" && !Array.isArray(data) ? data.brand : undefined;
    const brand = __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$brand$2e$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["brandSchema"].parse(custom || __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$brand$2e$json$2e5b$json$5d2e$cjs__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]);
    async function asset(file) {
        if (!file) return null;
        try {
            const bytes = await (0, __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$fs$2f$promises__$5b$external$5d$__$28$node$3a$fs$2f$promises$2c$__cjs$29$__["readFile"])(__TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].join(process.cwd(), "public", file));
            if (bytes.length > 2_000_000) throw new Error("Brand asset exceeds 2 MB");
            const ext = __TURBOPACK__imported__module__$5b$externals$5d2f$node$3a$path__$5b$external$5d$__$28$node$3a$path$2c$__cjs$29$__["default"].extname(file);
            const mime = ext === ".png" ? "image/png" : ext === ".woff2" ? "font/woff2" : ext === ".ttf" ? "font/ttf" : "image/jpeg";
            return "data:" + mime + ";base64," + bytes.toString("base64");
        } catch  {
            return null;
        }
    }
    return {
        ...brand,
        logoData: await asset(brand.logo),
        fontData: await asset(brand.font)
    };
}
}),
"[project]/src/lib/notifications/feed.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "buildActivityFeed",
    ()=>buildActivityFeed
]);
function object(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function words(value) {
    const text = value.replaceAll("_", " ");
    return text.charAt(0).toUpperCase() + text.slice(1);
}
const actions = {
    issue_invoice: "Invoice issued",
    confirm_payment: "Payment confirmed",
    allocate_credit: "Payment credit allocated",
    reverse_payment: "Payment reversed",
    apply_credit: "Credit correction applied",
    void_invoice: "Invoice voided",
    issue_proposal: "Proposal issued",
    accept_proposal: "Proposal accepted",
    mark_external: "Invoice sent externally"
};
function buildActivityFeed(source, targets) {
    const target = (id)=>id ? targets[id] : undefined;
    const related = (item)=>({
            company: item?.company || "",
            href: item?.href,
            record: item?.label
        });
    const deliveries = Object.fromEntries(source.deliveries.map((row)=>[
            row.id,
            row
        ]));
    const items = [
        ...source.audits.map((row)=>{
            const detail = object(row.detail);
            const ref = target(typeof detail.payment_id === "string" ? detail.payment_id : row.record_id);
            const title = actions[row.action] || (row.action.startsWith("save_") ? words(row.action.slice(5)) + " saved" : words(row.action));
            return {
                id: "change:" + row.id,
                category: "changes",
                title,
                message: ref ? `${title}: ${ref.label}.` : `${title}.`,
                status: "recorded",
                date: row.created_at,
                ...related(ref),
                details: Object.entries(detail).map(([label, value])=>({
                        label: words(label),
                        value: typeof value === "string" ? value : JSON.stringify(value) || "—"
                    }))
            };
        }),
        ...source.reminders.map((row)=>({
                id: "reminder:" + row.id,
                category: "reminders",
                title: row.channel === "billing" ? "New invoice ready for review" : "Invoice reminder",
                message: row.message,
                status: row.read_at ? "read" : "unread",
                date: row.created_at,
                ...related(target(row.invoice_id)),
                details: [
                    {
                        label: "Scheduled for",
                        value: row.scheduled_on
                    },
                    {
                        label: "Channel",
                        value: row.channel
                    },
                    ...row.read_at ? [
                        {
                            label: "Read at",
                            value: row.read_at
                        }
                    ] : []
                ]
            })),
        ...source.deliveries.map((row)=>({
                id: "delivery:" + row.id,
                category: "delivery",
                title: row.state === "external" ? "External delivery recorded" : "Invoice email update",
                message: row.state === "mock" ? "Test delivery recorded. No live email was delivered to the company." : row.state === "accepted" ? "The email provider accepted the message. This does not confirm the recipient has read it." : row.state === "external" ? `Invoice shared via ${row.channel}.` : `Email delivery status: ${row.state}.`,
                status: row.state,
                date: row.created_at,
                ...related(target(row.invoice_id)),
                details: [
                    {
                        label: "Recipient",
                        value: row.recipient || "—"
                    },
                    {
                        label: "Channel",
                        value: row.channel
                    }
                ]
            })),
        ...source.documents.map((row)=>({
                id: "document:" + row.id,
                category: "documents",
                title: words(row.kind) + " PDF update",
                message: row.state === "ready" ? "The archived PDF is ready to download." : row.state === "failed" ? "The PDF could not be prepared. Open the record to retry." : "The PDF is waiting to be generated.",
                status: row.state,
                date: row.created_at,
                ...related(target(row.record_id)),
                details: [
                    {
                        label: "Version",
                        value: String(row.version)
                    },
                    ...row.error ? [
                        {
                            label: "Error",
                            value: row.error
                        }
                    ] : []
                ]
            })),
        ...source.jobs.map((row)=>{
            const payload = object(row.payload);
            const delivery = typeof payload.attempt_id === "string" ? deliveries[payload.attempt_id] : undefined;
            const ref = target(delivery?.invoice_id || (typeof payload.invoice_id === "string" ? payload.invoice_id : undefined));
            return {
                id: "job:" + row.id,
                category: "system",
                title: row.kind === "invoice_email" ? "Invoice email processing" : row.kind === "admin_reminder" ? "Reminder processing" : words(row.kind),
                message: row.state === "done" ? "Processing completed. Check the delivery update for the actual sending result." : row.state === "failed" ? "Processing failed and needs review." : `Processing is ${row.state}.`,
                status: row.state,
                date: row.created_at,
                ...related(ref),
                details: [
                    {
                        label: "Attempts",
                        value: String(row.attempts)
                    },
                    {
                        label: "Scheduled attempt",
                        value: row.available_at
                    },
                    ...row.last_error ? [
                        {
                            label: "Last error",
                            value: row.last_error
                        }
                    ] : []
                ]
            };
        }),
        ...source.runs.map((row)=>({
                id: "run:" + row.id,
                category: "system",
                title: words(row.task),
                message: row.detail || "Scheduled workspace processing update.",
                status: row.state,
                date: row.created_at,
                company: "",
                details: []
            }))
    ];
    return items.sort((a, b)=>b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
}
}),
"[project]/src/lib/notifications/preview.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "loadNotificationPreview",
    ()=>loadNotificationPreview
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$render$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/render-admin.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notifications$2f$feed$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/notifications/feed.ts [app-rsc] (ecmascript)");
;
;
;
async function loadNotificationPreview() {
    const { db } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$render$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderAdmin"])();
    async function recent(table) {
        const { data, error } = await db.from(table).select("*").order("created_at", {
            ascending: false
        }).order("id", {
            ascending: false
        }).limit(20);
        if (error) throw new Error("Notification query failed");
        return data;
    }
    try {
        const [audits, reminders, deliveries, jobs, documents, runs] = await Promise.all([
            recent("audit_logs"),
            recent("notification_events"),
            recent("delivery_attempts"),
            recent("outbox_jobs"),
            recent("document_files"),
            recent("job_runs")
        ]);
        const source = {
            audits,
            reminders,
            deliveries,
            jobs,
            documents,
            runs
        };
        const ids = new Set();
        for (const row of audits){
            if (row.record_id) ids.add(row.record_id);
            const detail = row.detail;
            if (detail && typeof detail === "object" && !Array.isArray(detail) && typeof detail.payment_id === "string") ids.add(detail.payment_id);
        }
        for (const row of [
            ...reminders,
            ...deliveries
        ])if (row.invoice_id) ids.add(row.invoice_id);
        for (const row of documents)ids.add(row.record_id);
        for (const row of jobs){
            const payload = row.payload;
            if (payload && typeof payload === "object" && !Array.isArray(payload) && typeof payload.invoice_id === "string") ids.add(payload.invoice_id);
        }
        async function matching(table, keys) {
            if (!keys.length) return [];
            const { data, error } = await db.from(table).select("*").in("id", keys);
            if (error) throw new Error("Notification context query failed");
            return data;
        }
        const collections = [
            [
                "invoices",
                "invoices"
            ],
            [
                "payments",
                "payments"
            ],
            [
                "proposals",
                "proposals"
            ],
            [
                "projects",
                "projects"
            ],
            [
                "agreements",
                "agreements"
            ],
            [
                "services",
                "service_catalogue"
            ],
            [
                "expenses",
                "company_expenses"
            ]
        ];
        const records = await Promise.all(collections.map(async ([collection, table])=>({
                collection,
                rows: await matching(table, [
                    ...ids
                ])
            })));
        const companyIds = new Set(ids);
        for (const { rows } of records)for (const row of rows)if ("company_id" in row) companyIds.add(row.company_id);
        const companies = await matching("companies", [
            ...companyIds
        ]);
        const names = Object.fromEntries(companies.map((row)=>[
                row.id,
                row.name
            ]));
        const targets = {};
        for (const row of companies)targets[row.id] = {
            label: row.name,
            company: row.name,
            href: "/companies/" + row.id
        };
        for (const { collection, rows } of records)for (const row of rows){
            targets[row.id] = {
                label: String("number" in row && row.number || "receipt_number" in row && row.receipt_number || "title" in row && row.title || "name" in row && row.name || "description" in row && row.description || (collection === "payments" ? "Pending payment" : collection === "proposals" ? "Draft proposal" : "Draft invoice")),
                company: "company_id" in row ? names[row.company_id] || "Company unavailable" : "Workspace",
                href: "/" + collection + "/" + row.id
            };
        }
        const items = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notifications$2f$feed$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildActivityFeed"])(source, targets).slice(0, 20).map(({ id, title, message, status, date, category, company, record, href })=>({
                id,
                title,
                message,
                status,
                date,
                category,
                company,
                record,
                href
            }));
        return {
            items,
            error: ""
        };
    } catch  {
        return {
            items: [],
            error: "Notifications could not be loaded. Please try again."
        };
    }
}
}),
"[project]/src/lib/validation/schemas.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "agreementSchema",
    ()=>agreementSchema,
    "allocationsSchema",
    ()=>allocationsSchema,
    "briefSchema",
    ()=>briefSchema,
    "companySchema",
    ()=>companySchema,
    "expenseSchema",
    ()=>expenseSchema,
    "invoiceSchema",
    ()=>invoiceSchema,
    "lineSchema",
    ()=>lineSchema,
    "paymentSchema",
    ()=>paymentSchema,
    "projectSchema",
    ()=>projectSchema,
    "proposalSchema",
    ()=>proposalSchema,
    "schemas",
    ()=>schemas,
    "sectionSchema",
    ()=>sectionSchema,
    "serviceSchema",
    ()=>serviceSchema,
    "settingsSchema",
    ()=>settingsSchema
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .string>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$number$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .number>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$iso$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .iso>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .enum>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .uuid>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .object>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$union$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .union>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$literal$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .literal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$email$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .email>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$boolean$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .boolean>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$array$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .array>");
var __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$brand$2e$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/config/brand.schema.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$billing$2f$money$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/billing/money.ts [app-rsc] (ecmascript)");
;
;
;
const text = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().trim().max(4000);
const name = text.min(1).max(160);
const money = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$number$3e$__["z"].number().int().min(0).max(1e12);
const date = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$iso$3e$__["z"].iso.date();
const currency = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__["z"].enum(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$billing$2f$money$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["currencies"]);
const uuid = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$uuid$3e$__["z"].uuid();
const lineSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    description: text.min(1),
    quantity: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().regex(/^\d+(\.\d{1,3})?$/).refine((v)=>Number(v) > 0 && Number(v) <= 100000),
    rate: money,
    expense_id: uuid.nullable().optional()
});
const companyRef = {
    company_id: uuid,
    project_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$union$3e$__["z"].union([
        uuid,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$literal$3e$__["z"].literal("")
    ]).optional(),
    currency
};
const companySchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    name,
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$union$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$email$3e$__["z"].email(),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$literal$3e$__["z"].literal("")
    ]),
    address: text,
    contact: text,
    currency,
    terms_days: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$number$3e$__["z"].number().int().min(0).max(365),
    archived: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$boolean$3e$__["z"].boolean().optional()
});
const projectSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    ...companyRef,
    name,
    scope: text,
    price: money,
    advance: money,
    state: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__["z"].enum([
        "active",
        "completed",
        "archived"
    ]).optional()
}).refine((v)=>v.advance <= v.price, {
    message: "Advance exceeds project price"
});
const agreementSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    ...companyRef,
    name,
    billing_day: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$number$3e$__["z"].number().int().min(1).max(28).nullable().default(null),
    repeat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__["z"].enum([
        "monthly",
        "annually"
    ]).default("monthly"),
    reminder_days: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$number$3e$__["z"].number().int().min(0).max(365).nullable().default(null),
    starts_on: date,
    ends_on: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$union$3e$__["z"].union([
        date,
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$literal$3e$__["z"].literal("")
    ]).optional(),
    effective_from: date,
    active: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$boolean$3e$__["z"].boolean().optional(),
    items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$array$3e$__["z"].array(lineSchema).min(1).max(300)
});
const expenseSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    company_id: uuid,
    description: text.min(1),
    amount: money.positive(),
    currency,
    incurred_on: date
});
const invoiceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    ...companyRef,
    kind: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__["z"].enum([
        "one-off",
        "recurring",
        "advance",
        "balance"
    ]),
    period: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$union$3e$__["z"].union([
        date.refine((v)=>v.endsWith("-01"), "Select a billing month"),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$literal$3e$__["z"].literal("")
    ]).optional(),
    repeat: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__["z"].enum([
        "none",
        "monthly",
        "annually"
    ]).default("none"),
    due_date: date,
    discount: money,
    tax_bps: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$number$3e$__["z"].number().int().min(0).max(10000),
    notes: text,
    items: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$array$3e$__["z"].array(lineSchema).max(300)
}).refine((v)=>v.repeat === "none" || Boolean(v.period), {
    message: "Choose a billing month for a repeating invoice",
    path: [
        "period"
    ]
}).refine((v)=>v.repeat === "none" || v.items.some((item)=>!item.expense_id), {
    message: "A repeating invoice needs at least one recurring service",
    path: [
        "items"
    ]
});
const paymentSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    ...companyRef,
    amount: money.positive(),
    received_on: date,
    method: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$enum$3e$__["z"].enum([
        "bank",
        "cash",
        "other"
    ]),
    reference: text
});
const sectionSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    title: name,
    body: text
});
const briefSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    needs: text,
    goals: text,
    scope: text,
    deliverables: text,
    exclusions: text,
    timeline: text,
    payment_schedule: text,
    maintenance: text,
    future_options: text
});
const proposalSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    ...companyRef,
    title: name,
    price: money,
    brief: briefSchema,
    sections: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$array$3e$__["z"].array(sectionSchema).min(1).max(30)
});
const settingsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    billing_day: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$number$3e$__["z"].number().int().min(1).max(28).default(1),
    invoice_notice_days: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$number$3e$__["z"].number().int().min(0).max(365).default(7),
    name,
    address: text,
    email: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$union$3e$__["z"].union([
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$email$3e$__["z"].email(),
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$literal$3e$__["z"].literal("")
    ]),
    bank_details: text,
    notes: text,
    currency,
    terms_days: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$number$3e$__["z"].number().int().min(0).max(365),
    timezone: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$literal$3e$__["z"].literal("Asia/Colombo"),
    proposal_prompt: text.max(4000),
    brand: __TURBOPACK__imported__module__$5b$project$5d2f$config$2f$brand$2e$schema$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["brandSchema"].optional(),
    number_format: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$string$3e$__["z"].string().max(100).regex(/^[A-Za-z0-9{}_-]+$/).refine((v)=>[
            "{type}",
            "{company}",
            "{year}",
            "{sequence}"
        ].every((t)=>v.includes(t))).default("{type}-{company}-{year}-{sequence}")
});
const serviceSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    name,
    description: text,
    rate: money,
    currency,
    archived: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$boolean$3e$__["z"].boolean().optional()
});
const schemas = {
    expense: expenseSchema,
    company: companySchema,
    project: projectSchema,
    agreement: agreementSchema,
    invoice: invoiceSchema,
    payment: paymentSchema,
    proposal: proposalSchema,
    settings: settingsSchema,
    service: serviceSchema
};
const allocationsSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$array$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z__$2e$object$3e$__["z"].object({
    invoice_id: uuid,
    amount: money.positive()
})).max(300);
}),
]})(),
"[externals]/node:fs/promises [external] (node:fs/promises, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:fs/promises", () => require("node:fs/promises"));

module.exports = mod;
}),
"[externals]/node:path [external] (node:path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:path", () => require("node:path"));

module.exports = mod;
}),
"[project]/config/brand.json.[json].cjs [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = {
    "version": "neutral-v1",
    "name": "Ledger",
    "primary": "#254d42",
    "accent": "#dbedbb",
    "ink": "#202b28",
    "logo": null,
    "font": null,
    "documentTitle": "Business documents"
};
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1i8_ibcozlfbc._.js.map