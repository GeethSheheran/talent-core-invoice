(()=>{"use strict";module.exports = [
"[project]/.next-internal/server/app/(admin)/dashboard/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/(auth)/login/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/(admin)/notification-actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "009e1e4f863829f2055a5e8a67a710f6eaa9042156",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$login$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["signOut"],
    "00af6c128b2410529942d73130a469ff5ea35bb574",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$notification$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["getNotificationPreview"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f28$admin$292f$dashboard$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f28$auth$292f$login$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29222c$__ACTIONS_MODULE1__$3d3e$__$225b$project$5d2f$src$2f$app$2f28$admin$292f$notification$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/(admin)/dashboard/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/(auth)/login/actions.ts [app-rsc] (ecmascript)", ACTIONS_MODULE1 => "[project]/src/app/(admin)/notification-actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$login$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(auth)/login/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$notification$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(admin)/notification-actions.ts [app-rsc] (ecmascript)");
}),
"[project]/.next-internal/server/app/(admin)/dashboard/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/(auth)/login/actions.ts [app-rsc] (ecmascript)\", ACTIONS_MODULE1 => \"[project]/src/app/(admin)/notification-actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$auth$292f$login$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(auth)/login/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$notification$2d$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(admin)/notification-actions.ts [app-rsc] (ecmascript)");
;
;
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

// This function ensures that all the exported values are valid server actions,
// during the runtime. By definition all actions are required to be async
// functions, but here we can only check that they are functions.
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "ensureServerEntryExports", {
    enumerable: true,
    get: function() {
        return ensureServerEntryExports;
    }
});
function ensureServerEntryExports(actions) {
    for(let i = 0; i < actions.length; i++){
        const action = actions[i];
        if (typeof action !== 'function') {
            throw new Error(`A "use server" file can only export async functions, found ${typeof action}.\nRead more: https://nextjs.org/docs/messages/invalid-use-server-value`);
        }
    }
}
}),
"[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/* eslint-disable import/no-extraneous-dependencies */ Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "registerServerReference", {
    enumerable: true,
    get: function() {
        return _server.registerServerReference;
    }
});
const _server = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
}),
"[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript) <export * as z .email>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "z",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-rsc] (ecmascript)");
}),
"[project]/src/app/(admin)/notification-actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"00af6c128b2410529942d73130a469ff5ea35bb574":{"name":"getNotificationPreview"}},"src/app/(admin)/notification-actions.ts",""] */ __turbopack_context__.s([
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
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(getNotificationPreview, "00af6c128b2410529942d73130a469ff5ea35bb574", null);
}),
"[project]/src/app/(auth)/login/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"009e1e4f863829f2055a5e8a67a710f6eaa9042156":{"name":"signOut"},"601cc317cc8428d25cce0ae9db0e8a17f952e13395":{"name":"resetPassword"},"6062a63524d0cd079719cb774b9ebd3baf3e1499ba":{"name":"login"},"608434cedaa9dfe9c28e74a89962702b018ec3d53b":{"name":"recover"}},"src/app/(auth)/login/actions.ts",""] */ __turbopack_context__.s([
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
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(login, "6062a63524d0cd079719cb774b9ebd3baf3e1499ba", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(signOut, "009e1e4f863829f2055a5e8a67a710f6eaa9042156", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(recover, "608434cedaa9dfe9c28e74a89962702b018ec3d53b", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(resetPassword, "601cc317cc8428d25cce0ae9db0e8a17f952e13395", null);
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/require-admin.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notifications$2f$feed$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/notifications/feed.ts [app-rsc] (ecmascript)");
;
;
;
async function loadNotificationPreview() {
    const { db } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$require$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["requireAdmin"])();
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
];})()

//# sourceMappingURL=_1k60-ko6n3rd0._.js.map