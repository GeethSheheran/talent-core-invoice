module.exports = [
(()=>{"use strict";return[
"[project]/src/app/(admin)/[collection]/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ListPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$notifications$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/notifications-page.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$payments$2d$list$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/payments-list.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payments$2f$summary$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/payments/summary.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$navigation$2d$link$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/navigation-link.tsx [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$api$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/next/dist/api/navigation.react-server.js [app-rsc] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/components/navigation.react-server.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/repositories/records.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$collection$2d$list$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/collection-list.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
;
async function ListPage({ params, searchParams }) {
    const { collection } = await params;
    if (!(collection in __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tableMap"])) (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$components$2f$navigation$2e$react$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["notFound"])();
    const key = collection;
    const query = await searchParams;
    if (collection === "notifications") return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$notifications$2d$page$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NotificationsPage"], {}, void 0, false, {
        fileName: "[project]/src/app/(admin)/[collection]/page.tsx",
        lineNumber: 26,
        columnNumber: 46
    }, this);
    const [result, companies] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["tableMap"][key]).then((data)=>({
                data,
                error: ""
            })).catch((error)=>({
                data: [],
                error: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["recordLoadMessage"])(error)
            })),
        collection === "services" || collection === "companies" ? Promise.resolve([]) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("companies")
    ]);
    if (result.error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "card",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                children: collection.charAt(0).toUpperCase() + collection.slice(1)
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/[collection]/page.tsx",
                lineNumber: 38,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "error",
                role: "alert",
                children: result.error
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/[collection]/page.tsx",
                lineNumber: 39,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$navigation$2d$link$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                className: "button secondary",
                href: `/${collection}`,
                children: "Retry"
            }, void 0, false, {
                fileName: "[project]/src/app/(admin)/[collection]/page.tsx",
                lineNumber: 42,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/(admin)/[collection]/page.tsx",
        lineNumber: 37,
        columnNumber: 7
    }, this);
    const data = result.data;
    if (collection === "payments") {
        const payments = data.map(({ id, receipt_number, company_id, amount, currency, state, received_on, method, reference, created_at })=>({
                id,
                receipt_number,
                company_id,
                amount,
                currency,
                state,
                received_on,
                method,
                reference,
                created_at
            })).sort((a, b)=>b.created_at.localeCompare(a.created_at));
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "heading",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                            children: "Payments"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(admin)/[collection]/page.tsx",
                            lineNumber: 79,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$navigation$2d$link$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
                            className: "button",
                            href: "/payments/new",
                            children: "+ Record payment"
                        }, void 0, false, {
                            fileName: "[project]/src/app/(admin)/[collection]/page.tsx",
                            lineNumber: 80,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/(admin)/[collection]/page.tsx",
                    lineNumber: 78,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$payments$2d$list$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["PaymentsList"], {
                    rows: payments,
                    companies: Object.fromEntries(companies.map((company)=>[
                            company.id,
                            company.name
                        ])),
                    summaries: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$payments$2f$summary$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["summarizePayments"])(payments),
                    initialQuery: query.q,
                    initialStatus: [
                        "pending",
                        "confirmed",
                        "reversed"
                    ].includes(query.state || "") ? query.state : ""
                }, void 0, false, {
                    fileName: "[project]/src/app/(admin)/[collection]/page.tsx",
                    lineNumber: 84,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/(admin)/[collection]/page.tsx",
            lineNumber: 77,
            columnNumber: 7
        }, this);
    }
    // Send only list fields to the interactive client component.
    const fields = [
        "id",
        "name",
        "title",
        "description",
        "incurred_on",
        "invoice_id",
        "number",
        "code",
        "email",
        "company_id",
        "total",
        "amount",
        "price",
        "rate",
        "currency",
        "state",
        "archived",
        "active",
        "due_date",
        "created_at"
    ];
    const rows = data.map((row)=>Object.fromEntries(fields.filter((field)=>field in row).map((field)=>[
                field,
                row[field]
            ]))).sort((a, b)=>String(b.created_at).localeCompare(String(a.created_at)));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$collection$2d$list$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["CollectionList"], {
        collection: collection,
        rows: rows,
        companies: Object.fromEntries(companies.map((company)=>[
                company.id,
                company.name
            ])),
        initialQuery: query.q,
        initialStatus: query.state,
        initialPage: Number(query.page)
    }, void 0, false, {
        fileName: "[project]/src/app/(admin)/[collection]/page.tsx",
        lineNumber: 133,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/collection-list.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CollectionList",
    ()=>CollectionList
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const CollectionList = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call CollectionList() from the server but CollectionList is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/collection-list.tsx", "CollectionList");
}),
"[project]/src/components/collection-list.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$collection$2d$list$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/collection-list.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$collection$2d$list$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/components/notification-feed.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationFeed",
    ()=>NotificationFeed
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const NotificationFeed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call NotificationFeed() from the server but NotificationFeed is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/notification-feed.tsx", "NotificationFeed");
}),
"[project]/src/components/notification-feed.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$notification$2d$feed$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/notification-feed.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$notification$2d$feed$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/components/notifications-page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NotificationsPage",
    ()=>NotificationsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/repositories/records.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/(admin)/actions.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notifications$2f$feed$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/notifications/feed.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$notification$2d$feed$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/notification-feed.tsx [app-rsc] (ecmascript)");
;
;
;
;
;
async function NotificationsPage() {
    const [audits, reminders, deliveries, jobs, documents, runs, companies, invoices, payments, proposals, projects, agreements, services, expenses] = await Promise.all([
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("audit_logs"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("notification_events"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("delivery_attempts"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("outbox_jobs"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("document_files"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("job_runs"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("companies"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("invoices"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("payments"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("proposals"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("projects"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("agreements"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("service_catalogue"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$records$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["allRows"])("company_expenses")
    ]);
    const names = Object.fromEntries(companies.map((row)=>[
            row.id,
            row.name
        ]));
    const targets = {};
    for (const row of companies)targets[row.id] = {
        label: row.name,
        href: "/companies/" + row.id,
        company: row.name
    };
    for (const [collection, rows] of [
        [
            "invoices",
            invoices
        ],
        [
            "payments",
            payments
        ],
        [
            "proposals",
            proposals
        ],
        [
            "projects",
            projects
        ],
        [
            "agreements",
            agreements
        ],
        [
            "services",
            services
        ],
        [
            "expenses",
            expenses
        ]
    ]){
        for (const row of rows)targets[row.id] = {
            label: String("number" in row && row.number || "receipt_number" in row && row.receipt_number || "title" in row && row.title || "name" in row && row.name || "description" in row && row.description || (collection === "payments" ? "Pending payment" : "Draft invoice")),
            href: "/" + collection + "/" + row.id,
            company: "company_id" in row ? names[row.company_id] || "" : ""
        };
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "heading",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                    children: "Notifications"
                }, void 0, false, {
                    fileName: "[project]/src/components/notifications-page.tsx",
                    lineNumber: 74,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/notifications-page.tsx",
                lineNumber: 73,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$notification$2d$feed$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["NotificationFeed"], {
                items: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$notifications$2f$feed$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["buildActivityFeed"])({
                    audits,
                    reminders,
                    deliveries,
                    jobs,
                    documents,
                    runs
                }, targets)
            }, void 0, false, {
                fileName: "[project]/src/components/notifications-page.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                className: "activity-operations",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                        children: "Email processing"
                    }, void 0, false, {
                        fileName: "[project]/src/components/notifications-page.tsx",
                        lineNumber: 83,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "muted",
                        children: [
                            "Process queued email and reminder jobs.",
                            " ",
                            process.env.EMAIL_PROVIDER !== "resend" ? "Email is in test mode; no live delivery is recorded." : "The configured email provider and environment settings control delivery."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/notifications-page.tsx",
                        lineNumber: 84,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        action: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f28$admin$292f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["runPendingJobs"],
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "secondary",
                            children: "Process pending jobs"
                        }, void 0, false, {
                            fileName: "[project]/src/components/notifications-page.tsx",
                            lineNumber: 91,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/notifications-page.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/notifications-page.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/notifications-page.tsx",
        lineNumber: 72,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/components/payments-list.tsx [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PaymentsList",
    ()=>PaymentsList
]);
// This file is generated by next-core EcmascriptClientReferenceModule.
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const PaymentsList = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call PaymentsList() from the server but PaymentsList is on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/src/components/payments-list.tsx", "PaymentsList");
}),
"[project]/src/components/payments-list.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$payments$2d$list$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/src/components/payments-list.tsx [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$payments$2d$list$2e$tsx__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/src/lib/db/repositories/records.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "RecordLoadError",
    ()=>RecordLoadError,
    "allRows",
    ()=>allRows,
    "balances",
    ()=>balances,
    "oneRow",
    ()=>oneRow,
    "recordLoadMessage",
    ()=>recordLoadMessage,
    "tableMap",
    ()=>tableMap
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$render$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/auth/render-admin.ts [app-rsc] (ecmascript)");
;
;
const tableMap = {
    expenses: "company_expenses",
    companies: "companies",
    services: "service_catalogue",
    projects: "projects",
    agreements: "agreements",
    proposals: "proposals",
    invoices: "invoices",
    payments: "payments",
    notifications: "notification_events"
};
class RecordLoadError extends Error {
    table;
    code;
    constructor(table, code){
        super(`Could not load ${table}`), this.table = table, this.code = code;
    }
}
function recordLoadMessage(error) {
    if (error instanceof RecordLoadError && [
        "PGRST205",
        "42P01",
        "42703"
    ].includes(error.code)) {
        return "This section needs a database update. Apply the pending expenses and recurring schedules migration to the configured Supabase project, then retry. Existing records are preserved.";
    }
    return "This section could not be loaded. Check the database connection and access permissions, then retry. Existing records are preserved.";
}
async function allRows(table, companyId) {
    const { db } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$render$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderAdmin"])();
    const rows = [];
    for(let start = 0;; start += 1000){
        let query = db.from(table).select("*");
        if (companyId) query = query.eq("company_id", companyId);
        const { data, error } = await query.order("id", {
            ascending: true
        }).range(start, start + 999);
        if (error) {
            // Callers show a typed, recoverable section error. Logging it as a console
            // error also opens the development overlay on otherwise usable pages.
            throw new RecordLoadError(table, error.code);
        }
        const batch = data;
        rows.push(...batch);
        if (batch.length < 1000) break;
    }
    return rows;
}
async function balances() {
    const { db } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$render$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderAdmin"])();
    const rows = [];
    for(let start = 0;; start += 1000){
        const { data, error } = await db.from("invoice_balances").select("*").order("id", {
            ascending: true
        }).range(start, start + 999);
        if (error) throw new Error("Could not load balances");
        rows.push(...data);
        if (data.length < 1000) break;
    }
    return rows;
}
async function oneRow(table, id) {
    const { db } = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$auth$2f$render$2d$admin$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["renderAdmin"])();
    const { data, error } = await db.from(table).select("*").eq("id", id).maybeSingle();
    if (error) throw new Error("Could not load record");
    return data;
}
}),
"[project]/src/lib/payments/summary.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "summarizePayments",
    ()=>summarizePayments
]);
function summarizePayments(rows) {
    return [
        [
            "all",
            "All payments"
        ],
        [
            "confirmed",
            "Confirmed"
        ],
        [
            "pending",
            "Awaiting confirmation"
        ],
        [
            "reversed",
            "Reversed"
        ]
    ].map(([state, label])=>{
        const selected = rows.filter((row)=>state === "all" || row.state === state);
        const sums = new Map();
        for (const row of selected)sums.set(row.currency, (sums.get(row.currency) || 0n) + BigInt(row.amount));
        return {
            state,
            label,
            count: selected.length,
            amounts: [
                ...sums
            ].sort(([a], [b])=>a.localeCompare(b)).map(([currency, amount])=>`${currency} ${(amount / 100n).toLocaleString("en-LK")}.${(amount % 100n).toString().padStart(2, "0")}`)
        };
    });
}
}),
]})(),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/(admin)/[collection]/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/(admin)/[collection]/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__1rs3nzwdb_9bh._.js.map