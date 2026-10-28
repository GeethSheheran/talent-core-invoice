module.exports = [
"[project]/config/brand.schema.ts [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[project]/config/brand.schema.ts [app-rsc] (ecmascript)");
    });
});
}),
"[project]/src/lib/notifications/outbox.ts [app-rsc] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/node_modules_14x32hc52yjj-._.js",
  "server/chunks/ssr/src_lib_0qps-hl2uwybj._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/src/lib/notifications/outbox.ts [app-rsc] (ecmascript)");
    });
});
}),
];