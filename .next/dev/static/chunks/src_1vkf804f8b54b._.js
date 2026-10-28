(()=>{"use strict";(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/billing-chart.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BillingChart",
    ()=>BillingChart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$billing$2f$money$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/billing/money.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function BillingChart({ months, currency }) {
    _s();
    const [active, setActive] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const max = Math.max(1, ...months.flatMap((month)=>[
            month.issued,
            month.collected
        ]));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "chart",
        "aria-label": "Monthly billing activity",
        children: months.map((month, index)=>{
            const label = new Date(month.month + "-01T00:00:00Z").toLocaleDateString("en-GB", {
                month: "short",
                year: "numeric",
                timeZone: "UTC"
            });
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "chart-month",
                children: [
                    [
                        "issued",
                        "collected"
                    ].map((kind)=>{
                        const key = month.month + kind;
                        const companies = kind === "issued" ? month.issuedCompanies : month.collectedCompanies;
                        const description = `${label} · ${kind === "issued" ? "Issued" : "Collected"}: ${(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$billing$2f$money$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMoney"])(month[kind], currency)} · ${companies} ${companies === 1 ? "company" : "companies"}`;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            className: "bar " + (kind === "collected" ? "light" : ""),
                            style: {
                                height: month[kind] / max * 100 + "%"
                            },
                            "aria-label": description,
                            "aria-describedby": active === key ? "billing-tooltip" : undefined,
                            onPointerEnter: ()=>setActive(key),
                            onPointerLeave: ()=>setActive(null),
                            onFocus: ()=>setActive(key),
                            onBlur: ()=>setActive(null),
                            onClick: ()=>setActive(key),
                            onKeyDown: (event)=>{
                                if (event.key === "Escape") setActive(null);
                            },
                            children: active === key && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                role: "tooltip",
                                id: "billing-tooltip",
                                className: "chart-tooltip " + (index > 3 ? "align-right" : "align-left"),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                        children: [
                                            label,
                                            " · ",
                                            kind === "issued" ? "Issued" : "Collected"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/billing-chart.tsx",
                                        lineNumber: 70,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$billing$2f$money$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["formatMoney"])(month[kind], currency)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/billing-chart.tsx",
                                        lineNumber: 73,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("small", {
                                        children: [
                                            companies,
                                            " ",
                                            companies === 1 ? "company" : "companies"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/billing-chart.tsx",
                                        lineNumber: 74,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/billing-chart.tsx",
                                lineNumber: 62,
                                columnNumber: 21
                            }, this)
                        }, kind, false, {
                            fileName: "[project]/src/components/billing-chart.tsx",
                            lineNumber: 43,
                            columnNumber: 17
                        }, this);
                    }),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "chart-label",
                        children: label.split(" ")[0]
                    }, void 0, false, {
                        fileName: "[project]/src/components/billing-chart.tsx",
                        lineNumber: 82,
                        columnNumber: 13
                    }, this)
                ]
            }, month.month, true, {
                fileName: "[project]/src/components/billing-chart.tsx",
                lineNumber: 34,
                columnNumber: 11
            }, this);
        })
    }, void 0, false, {
        fileName: "[project]/src/components/billing-chart.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_s(BillingChart, "UiziKGcot5E8nbuQQ2ZlRLdhk5k=");
_c = BillingChart;
var _c;
__turbopack_context__.k.register(_c, "BillingChart");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/new-menu.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NewMenu",
    ()=>NewMenu
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.mjs [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.mjs [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function NewMenu() {
    _s();
    const [open, setOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const root = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const trigger = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NewMenu.useEffect": ()=>{
            if (!open) return;
            const outside = {
                "NewMenu.useEffect.outside": (event)=>{
                    if (!root.current?.contains(event.target)) setOpen(false);
                }
            }["NewMenu.useEffect.outside"];
            document.addEventListener("pointerdown", outside);
            return ({
                "NewMenu.useEffect": ()=>document.removeEventListener("pointerdown", outside)
            })["NewMenu.useEffect"];
        }
    }["NewMenu.useEffect"], [
        open
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "new-menu",
        ref: root,
        onPointerEnter: (event)=>{
            if (event.pointerType === "mouse") setOpen(true);
        },
        onPointerLeave: (event)=>{
            if (event.pointerType === "mouse" && !root.current?.contains(document.activeElement)) setOpen(false);
        },
        onBlur: (event)=>{
            if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        },
        onKeyDown: (event)=>{
            if (event.key === "Escape") {
                setOpen(false);
                trigger.current?.focus();
            }
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                ref: trigger,
                "aria-expanded": open,
                "aria-controls": "new-record-options",
                onClick: ()=>setOpen(true),
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                        size: 17,
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/src/components/new-menu.tsx",
                        lineNumber: 48,
                        columnNumber: 9
                    }, this),
                    "New",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                        className: "menu-chevron",
                        size: 16,
                        "aria-hidden": "true"
                    }, void 0, false, {
                        fileName: "[project]/src/components/new-menu.tsx",
                        lineNumber: 50,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/new-menu.tsx",
                lineNumber: 41,
                columnNumber: 7
            }, this),
            open && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                id: "new-record-options",
                className: "new-menu-options",
                "aria-label": "Create new",
                children: [
                    [
                        "Company",
                        "/companies/new"
                    ],
                    [
                        "Proposal",
                        "/proposals/new"
                    ],
                    [
                        "Invoice",
                        "/invoices/new"
                    ],
                    [
                        "Expense",
                        "/expenses/new"
                    ],
                    [
                        "Receipt",
                        "/payments/new"
                    ]
                ].map(([label, href])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: href,
                        onClick: ()=>setOpen(false),
                        children: label
                    }, label, false, {
                        fileName: "[project]/src/components/new-menu.tsx",
                        lineNumber: 65,
                        columnNumber: 13
                    }, this))
            }, void 0, false, {
                fileName: "[project]/src/components/new-menu.tsx",
                lineNumber: 53,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/new-menu.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(NewMenu, "8bfeVI8Z+9yTbBxxVECFN77w5Jw=");
_c = NewMenu;
var _c;
__turbopack_context__.k.register(_c, "NewMenu");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/billing/money.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$decimal$2e$js$2f$decimal$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/decimal.js/decimal.mjs [app-client] (ecmascript)");
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
    const d = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$decimal$2e$js$2f$decimal$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](value).mul(100);
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
    return new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$decimal$2e$js$2f$decimal$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"](amount).div(100).toFixed(2);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);})()

//# sourceMappingURL=src_1vkf804f8b54b._.js.map