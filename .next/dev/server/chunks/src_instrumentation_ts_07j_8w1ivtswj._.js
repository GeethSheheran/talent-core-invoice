module.exports = [
"[project]/src/instrumentation.ts [instrumentation] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "register",
    ()=>register
]);
async function register() {
    if ("TURBOPACK compile-time truthy", 1) {
        const { validateRuntimeEnvironment } = await __turbopack_context__.A("[project]/src/lib/env.ts [instrumentation] (ecmascript, async loader)");
        validateRuntimeEnvironment();
    }
}
}),
];

//# sourceMappingURL=src_instrumentation_ts_07j_8w1ivtswj._.js.map