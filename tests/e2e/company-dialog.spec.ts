import { test, expect } from "@playwright/test";
import { build } from "esbuild";
import { readFile } from "node:fs/promises";

// Isolated UI harness: actual components, mocked server boundaries, no database writes.
let javascript: string;
let css: string;
test.beforeAll(async () => {
  css = (await readFile("src/app/globals.css", "utf8")).replace(
    '@import "tailwindcss";',
    "",
  );
  const result = await build({
    stdin: {
      contents: `import { createRoot } from "react-dom/client";
      import { useState } from "react";
      import { DashboardOverview } from "./src/components/dashboard-overview";
      import { InvoiceWorkflow } from "./src/components/invoice-workflow";
      import { CompanyTracking } from "./src/components/company-tracking";
      import { DocumentThumbnail } from "./src/components/document-thumbnail";
      import { MetricAmount } from "./src/components/metric-amount";
      import { SettingsMenu } from "./src/components/layout/settings-menu";
      import { NotificationFeed } from "./src/components/notification-feed";
      import { NotificationMenu } from "./src/components/layout/notification-menu";
      import { MobileNavigation } from "./src/components/layout/mobile-navigation";
      import { Sidebar } from "./src/components/layout/sidebar";
      import { CollectionList } from "./src/components/collection-list";
      import { NewMenu } from "./src/components/new-menu";
      import { RecordEditor } from "./src/components/record-editor";
      import { ServicesList } from "./src/components/services-list";
      import { RecordsTable } from "./src/components/records-table";
      import { WorkspaceTitle } from "./src/components/layout/workspace-title";
      import { BillingChart } from "./src/components/billing-chart";
      import { NotificationPreview } from "./src/components/notification-preview";
      import { CompanySectionNav } from "./src/components/company-section-nav";
      import { CompanyRecordDialog } from "./src/components/company-record-dialog";
      function InvoiceLayoutFixture() { return <main className="content"><section className="card invoice-overview-layout"><div className="invoice-overview-facts"><h2>Overview</h2><dl className="detail-list"><dt>Services</dt><dd>8</dd><dt>Expenses</dt><dd>1</dd><dt>Tax</dt><dd>LKR 120.00</dd></dl></div><aside className="invoice-preview-card"><DocumentThumbnail><article className="document invoice-document">A4 invoice preview</article></DocumentThumbnail></aside></section><InvoiceWorkflow id="invoice" state="draft" company="company" currency="LKR" outstanding={1000} files={[]} sentOn={null} paused={false} dueDate="2026-11-15" emailPending={false}/><CompanyTracking rows={[{id:"invoice",number:"INV-001",state:"issued",outstanding:0,total:1000,currency:"LKR",due_date:"2026-11-15"}]} /></main>; }
      function NavigationFixture() { const [selected, setSelected] = useState("overview"); return <div><div className="workspace-tools"><SettingsMenu /></div><aside className="company-sidebar" style={{ width: 240 }}><CompanySectionNav companyId="10000000-0000-4000-8000-000000000001" selected={selected} onNavigate={() => setSelected("expenses")} /></aside></div>; }
      function OverviewFixture() { return <div className="shell"><Sidebar /><div><header className="workspace-bar"><span>Ledger / Overview</span><div className="workspace-tools"><NotificationMenu /><SettingsMenu /></div></header><main className="content"><div className="heading"><div><h1>Overview</h1></div><NewMenu /></div><DashboardOverview currency="LKR" today="2026-11-05" totals={{collected:245000000,issued:360000000,outstanding:185000000,overdue:65000000}} months={Array.from({length:6},(_,i)=>({month:"2026-"+String(i+6).padStart(2,"0"),issued:180000000+i*36000000,collected:120000000+i*25000000,issuedCompanies:6,collectedCompanies:4}))} invoices={[{id:"late",company_id:"one",number:"INV-001",state:"issued",currency:"LKR",total:85000000,outstanding:65000000,due_date:"2026-09-20"},{id:"due",company_id:"two",number:"INV-002",state:"issued",currency:"LKR",total:120000000,outstanding:120000000,due_date:"2026-11-08"},{id:"draft",company_id:"one",number:null,state:"draft",currency:"LKR",total:500000,outstanding:500000,due_date:"2026-11-08"}]} payments={[{id:"pending",company_id:"one",state:"pending",currency:"LKR",amount:1000000}]} proposals={[{id:"prop",company_id:"two",title:"Annual HR services",currency:"LKR",price:240000000,state:"issued"}]} companies={{one:"Harbour Trading",two:"Ceylon Studio"}} /></main></div></div>; }
      createRoot(document.getElementById("root")).render(location.search.includes("notification-feed") ? <main className="content"><NotificationFeed items={[{id:"feed-1",title:"Service saved",message:"Hosting updated",status:"recorded",date:"2026-11-06T09:00:00Z",category:"changes",company:"Test company",record:"Hosting",href:"/services/10000000-0000-4000-8000-000000000020",details:[]},{id:"feed-2",title:"Payment confirmed",message:"Payment received",status:"recorded",date:"2026-11-06T08:00:00Z",category:"changes",company:"Test company",record:"REC-1",details:[]}]} /></main> : location.search.includes("invoice-layout") ? <InvoiceLayoutFixture /> : location.search.includes("overview-design") ? <OverviewFixture /> : location.search.includes("metric-fit") ? <main className="content"><div className="stats">{["LKR 0.00", "LKR 124,500.00", "LKR 9,999,999,999.99", "LKR 124,500.00"].map((value, i) => <div className="stat" key={i}><div>Amount</div><MetricAmount>{value}</MetricAmount></div>)}</div></main> : location.search.includes("invoice-tracker") ? <RecordsTable hideCompany collection="invoices" rows={[{id: "10000000-0000-4000-8000-000000000030", company_id: "10000000-0000-4000-8000-000000000001", number: "INV-030", currency: "LKR", total: 20000, state: "issued", first_sent_on: location.search.includes("unsent") ? null : "2026-10-29"}]} /> : location.search.includes("service-editor") ? <main><RecordEditor kind="service" onSave={async (form) => { window.fixtureService = JSON.parse(form.get("payload")); return ""; }} initial={{parent_id: "10000000-0000-4000-8000-000000000020", currency: "LKR", archived: location.search.includes("inactive")}} services={[{id: "10000000-0000-4000-8000-000000000020", name: "Website", currency: "LKR", rate: 10000}]} /></main> : location.search.includes("service-tree") ? <main><ServicesList rows={[{id: "parent", name: "Website", rate: 10000, currency: "LKR"}, {id: "child", parent_id: "parent", name: "Hosting", rate: 1000, currency: "LKR"}]} /></main> : location.search.includes("mobile-layout") ? <div className="shell"><Sidebar /><div><header className="workspace-bar"><MobileNavigation /><a href="/dashboard" className="workspace-identity">Ledger <WorkspaceTitle /></a><div className="workspace-tools"><NotificationMenu /><SettingsMenu /></div></header><main className="content"><CollectionList collection={new URLSearchParams(location.search).get("collection") || "services"} rows={[{id: "service-1", name: "Web development", number: "INV-CMP0001-2026-00001", company_id: "company", rate: 12000000, currency: "LKR", active: true, created_at: "2026-10-28"}]} companies={{company: "Example company"}} /><div className="heading"><h1>Overview</h1><div className="actions"><NewMenu /></div></div></main></div></div> : <main className="content"><header className="workspace-bar"><span>Ledger <WorkspaceTitle /></span><div className="workspace-tools"><NotificationMenu /></div></header><h1>Company workspace</h1><NavigationFixture /><NewMenu /><CompanyRecordDialog companyId="10000000-0000-4000-8000-000000000001" collection="projects" /><CompanyRecordDialog companyId="10000000-0000-4000-8000-000000000001" collection="payments" /><CompanyRecordDialog companyId="10000000-0000-4000-8000-000000000001" collection="invoices" /><CompanyRecordDialog companyId="10000000-0000-4000-8000-000000000001" collection="invoices" recordId="10000000-0000-4000-8000-000000000002" label="View draft invoice" /><section aria-label="Service catalogue"><RecordsTable collection="services" rows={[{id: "service-1", name: "Web development", rate: 12000, currency: "LKR", active: true}]} /></section><div className="grid dashboard-activity-grid"><section className="card dashboard-billing"><div className="heading"><h2>Billing activity</h2></div><BillingChart months={[{month: "2026-10", issued: 12000, collected: 6000, issuedCompanies: 1, collectedCompanies: 1}]} currency="LKR" /><p className="chart-legend">Issued charges</p></section><section className="card dashboard-notifications"><div className="heading"><h2>Latest notifications</h2></div><NotificationPreview items={Array.from({length: 5}, (_, index) => ({id: "layout-" + index, title: "Invoice update", message: "Invoice saved", status: "recorded", date: "2026-10-27T10:00:00Z", category: "changes", company: "Test Company", record: "INV-001", href: "/invoices/invoice"}))} /></section></div></main>);`,
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    platform: "browser",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"test"' },
    plugins: [
      {
        name: "test-server-boundaries",
        setup(builder) {
          builder.onResolve(
            {
              filter:
                /^(next\/(navigation|link)|@\/lib\/client\/workspace-reads|@\/app\/\(admin\)\/(company-actions|notification-actions|actions)|@\/app\/\(auth\)\/login\/actions)$/,
            },
            (args) => ({ path: args.path, namespace: "fixture" }),
          );
          builder.onLoad({ filter: /.*/, namespace: "fixture" }, (args) => ({
            contents:
              args.path === "next/navigation"
                ? `export const usePathname = () => "/services"; export const useRouter = () => ({ push(url) { window.fixtureNavigation = url; }, refresh() { window.fixtureRefreshCount = (window.fixtureRefreshCount || 0) + 1; } }); export const useSearchParams = () => new URLSearchParams(location.search);`
                : args.path === "next/link"
                  ? `import React from "react"; export const useLinkStatus = () => ({ pending: false }); export default function Link({children, scroll, onClick, ...props}) { return React.createElement("a", {...props, onClick(event) { event.preventDefault(); onClick?.(event); }}, children); }`
                  : `
        export async function importServiceWorkbook() { return { result: { added: 83, existing: 0 } }; }
        export async function deleteService() { return ""; }
        export async function saveServiceInDrawer(form) { if (window.fixtureServiceError) return {error: "Unable to save service."}; window.fixtureService = JSON.parse(form.get("payload")); return {id: form.get("id") || "new-child", kind: "service"}; }
        export async function signOut() {}
        const company = "10000000-0000-4000-8000-000000000001";
        export async function loadCompanyEditor(_, collection) {
          if (location.search.includes("unavailable")) return { error: "This section needs a database update." };
          return { data: { initial: { company_id: company, currency: "LKR" }, companies: [{ id: company, name: "Test company", currency: "LKR" }], projects: location.search.includes("agreed-invoice") ? [{ id: "10000000-0000-4000-8000-000000000010", company_id: company, name: "Agreed website services", currency: "LKR", state: "active", discount: 3000, items: [{ id: "10000000-0000-4000-8000-000000000011", name: "Monthly design", quantity: "2", rate: 10000, discount: 2000, billing_type: "monthly" }, { id: "10000000-0000-4000-8000-000000000012", name: "Already billed setup", quantity: "1", rate: 12000, discount: 0, billing_type: "one-time" }] }] : [], billedServiceIds: ["10000000-0000-4000-8000-000000000012"], services: collection === "projects" ? [{ id: "10000000-0000-4000-8000-000000000003", name: "Design", description: "", currency: "LKR", rate: 10000, billing_type: "monthly" }, { id: "10000000-0000-4000-8000-000000000004", parent_id: "10000000-0000-4000-8000-000000000003", name: "Setup", description: "", currency: "LKR", rate: 5000, billing_type: "one-time" }] : [], pendingExpenses: [] } };
        }
        export async function saveCompanyRecord(_, form) { window.fixtureRow = { ...JSON.parse(form.get("payload")), id: "10000000-0000-4000-8000-000000000002", state: "pending" }; return { id: window.fixtureRow.id }; }
        export async function loadCompanyRecord() {
          window.fixtureRow ||= { id: "10000000-0000-4000-8000-000000000002", state: "draft", currency: "LKR", total: 10000 };
          const pendingExpenses = window.fixtureRow.state === "draft" && !window.fixtureAttached ? [{ id: "10000000-0000-4000-8000-000000000003", description: "Domain renewal", amount: 2500, currency: "LKR", incurred_on: "2026-01-01" }] : [];
          return { data: { row: window.fixtureRow, invoices: [], items: [], pendingExpenses } };
        }
        export async function financialAction(_, form) {
          if (form.get("action") === "attach_pending_expenses") { window.fixtureAttached = true; window.fixtureRow.total += 2500; }
          else if (form.get("action") !== "mark_external") window.fixtureRow.state = "confirmed";
          return "Saved successfully.";
        }
        export async function getNotificationPreview() {
          if (location.search.includes("notification-error")) return { items: [], error: "Notifications could not be loaded. Please try again." };
          return { error: "", items: Array.from({length: 20}, (_, index) => ({ id: "notice-" + index, title: "Invoice update " + index, message: "Invoice details for preview " + index, status: "recorded", date: "2026-10-27T10:00:00Z", category: "changes", company: "Test Company", record: "INV-001", href: "/invoices/invoice" })) };
        }
        export async function saveRecord() { throw new Error("Standalone navigation must not be used"); }
      `,
            loader: "js",
            resolveDir: process.cwd(),
          }));
        },
      },
    ],
  });
  javascript = result.outputFiles[0].text;
});
test.beforeEach(async ({ page }) => {
  await page.route("**/company-ui-fixture**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style></head><body><div id="root"></div><script>${javascript.replaceAll("</script", "<\\/script")}</script></body></html>`,
    }),
  );
});
test("records and confirms a payment in the popup without leaving the company", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture");
  await page
    .getByRole("button", { name: "Record payment", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Company", { exact: true })).toBeDisabled();
  await dialog.getByLabel("Amount received").fill("125");
  await dialog.getByLabel("Payment received date").fill("2026-10-27");
  await dialog.getByRole("button", { name: "Review changes" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Review payment" }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect(
    dialog.getByText("Saved. You’re still in this company’s workspace."),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Review confirm payment" }).click();
  await dialog
    .getByRole("button", { name: "Confirm payment", exact: true })
    .click();
  await expect(
    dialog.getByRole("button", { name: "Download receipt" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/company-ui-fixture$/);
  await dialog.getByRole("button", { name: "Close dialog" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Record payment", exact: true }),
  ).toBeFocused();
});
test("keeps a failed section inside the popup and allows dismissal", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture?unavailable");
  await page.getByRole("button", { name: "New invoice" }).click();
  await expect(page.getByRole("alert")).toContainText("database update");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Company workspace" }),
  ).toBeVisible();
});
test("invoice popup fits a mobile viewport and supports Escape", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/company-ui-fixture");
  await page.getByRole("button", { name: "New invoice" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Company", { exact: true })).toBeDisabled();
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".artifacts/company-invoice-mobile.png",
    fullPage: true,
  });
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
});

test("settings gear opens section links and supports Escape and keyboard reopening", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture");
  await page.getByRole("button", { name: "Workspace settings" }).click();
  const menu = page.getByRole("navigation", {
    name: "Settings quick navigation",
  });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("link", { name: "Branding" })).toHaveAttribute(
    "href",
    /section=branding$/,
  );
  await menu.getByRole("link", { name: "Branding" }).focus();
  await page.keyboard.press("Escape");
  await expect(menu).not.toBeVisible();
  const button = page.getByRole("button", { name: "Workspace settings" });
  await button.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toBeVisible();
  await menu.getByRole("link", { name: "Billing" }).click();
  await expect(menu).not.toBeVisible();
});
test("company section highlight moves to the selected section", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture");
  const nav = page.getByRole("navigation", {
    name: "Company sections",
    exact: true,
  });
  const marker = nav.locator(".company-nav-indicator");
  const initial = await marker.evaluate((element) => element.style.transform);
  await nav.getByRole("link", { name: "Expenses" }).click();
  await expect(nav.getByRole("link", { name: "Expenses" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect
    .poll(() => marker.evaluate((element) => element.style.transform))
    .not.toBe(initial);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(marker).toHaveCSS("transition-duration", "0s");
});

test("draft invoice shows pending expenses and refreshes its total after attaching", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture");
  await page.getByRole("button", { name: "View draft invoice" }).click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "1 pending expense available" }),
  ).toBeVisible();
  await expect(
    dialog.getByText("Domain renewal", { exact: false }),
  ).toBeVisible();
  await dialog
    .getByRole("button", { name: "Add these expenses to invoice" })
    .click();
  await expect(
    dialog.getByRole("heading", { name: "1 pending expense available" }),
  ).not.toBeVisible();
  await expect(dialog.getByText(/125\.00/)).toBeVisible();
  await expect(page).toHaveURL(/company-ui-fixture$/);
});

test("bell previews notifications in a scrollable panel without navigation", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture");
  await page.getByRole("button", { name: "Preview notifications" }).click();
  const panel = page.locator("#notification-preview-panel");
  await expect(panel.locator("details")).toHaveCount(0);
  await expect(panel.getByText("Test Company").first()).toBeVisible();
  await expect(panel.getByText("INV-001").first()).toBeVisible();
  await panel.getByRole("button", { name: /Invoice update 0/ }).click();
  const detail = page.getByRole("dialog", { name: "Invoice update 0" });
  await expect(
    detail.getByText("Invoice details for preview 0", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(detail).not.toBeVisible();
  await page.getByRole("button", { name: "Preview notifications" }).click();
  const scroll = panel.getByRole("region", { name: "Recent notifications" });
  expect(
    await scroll.evaluate(
      (element) => element.scrollHeight > element.clientHeight,
    ),
  ).toBe(true);
  await expect(page).toHaveURL(/company-ui-fixture$/);
  await panel
    .getByRole("button", { name: "Close notification preview" })
    .click();
  await expect(panel).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Preview notifications" }),
  ).toBeFocused();
});
test("header stays pinned, settings links align left, and receipt helper text is removed", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture");
  await page.getByRole("button", { name: "Workspace settings" }).click();
  const link = page
    .getByRole("navigation", { name: "Settings quick navigation" })
    .getByRole("link", { name: "Business" });
  await expect(link).toHaveCSS("justify-content", "flex-start");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "New", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Receipt", exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Record and confirm a payment")).toHaveCount(0);
  await page.evaluate(() => {
    const filler = document.createElement("div");
    filler.style.height = "2000px";
    document.querySelector("main")?.append(filler);
    window.scrollTo(0, 500);
  });
  await expect
    .poll(async () => (await page.locator(".workspace-bar").boundingBox())?.y)
    .toBe(0);
});
test("notification preview handles failure and stays within mobile viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/company-ui-fixture?notification-error");
  await page.getByRole("button", { name: "Preview notifications" }).click();
  const panel = page.locator("#notification-preview-panel");
  await expect(panel.getByRole("alert")).toContainText("could not be loaded");
  const bounds = await panel.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await expect(panel.getByRole("button", { name: "Retry" })).toBeVisible();
});

test("company menu does not move on hover and services have no company column", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture");
  const link = page
    .getByRole("navigation", { name: "Company sections", exact: true })
    .getByRole("link", { name: "Agreed services" });
  const before = await link.boundingBox();
  await link.hover();
  await expect(link).toHaveCSS("transform", "none");
  expect(await link.boundingBox()).toEqual(before);
  const services = page.getByRole("region", { name: "Service catalogue" });
  await expect(
    services.getByRole("columnheader", { name: "Company", exact: true }),
  ).toHaveCount(0);
  await expect(services.getByRole("columnheader")).toHaveCount(4);
  await expect(page.locator(".workspace-bar")).toContainText("Services");
});

test("dashboard activity cards match heights and chart fills available space", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/company-ui-fixture");
  const chartCard = page.locator(".dashboard-billing");
  const notifications = page.locator(".dashboard-notifications");
  const chart = page.locator(".dashboard-billing .chart");
  const left = await chartCard.boundingBox();
  const right = await notifications.boundingBox();
  expect(Math.abs(left!.height - right!.height)).toBeLessThanOrEqual(1);
  expect((await chart.boundingBox())!.height).toBeGreaterThan(220);
  const bars = await chart
    .locator(".bar")
    .evaluateAll((elements) =>
      elements.map((element) => element.getBoundingClientRect().height),
    );
  expect(bars[0]).toBeGreaterThan(100);
  expect(Math.abs(bars[0] / bars[1] - 2)).toBeLessThan(0.1);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("mobile drawer closes on Escape, navigation, and desktop resize", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/company-ui-fixture?mobile-layout");
  await expect(page.locator(".desktop-sidebar")).not.toBeVisible();
  const toggle = page.getByRole("button", { name: "Open navigation" });
  await toggle.click();
  const drawer = page.getByRole("dialog", { name: "Workspace navigation" });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByRole("button", { name: "Sign out" })).toBeVisible();
  await expect(
    drawer.getByRole("link", { name: "Services", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await expect(toggle).toBeFocused();
  await toggle.click();
  await drawer.getByRole("link", { name: "Invoices", exact: true }).click();
  await expect(drawer).not.toBeVisible();
  await toggle.click();
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(drawer).not.toBeVisible();
  await expect(page.locator(".desktop-sidebar")).toBeVisible();
  await expect(toggle).not.toBeVisible();
});

for (const width of [320, 390, 720]) {
  test(`mobile lists and controls fit at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const collection of [
      "services",
      "companies",
      "projects",
      "agreements",
      "proposals",
      "invoices",
      "expenses",
    ]) {
      await page.goto(
        `/company-ui-fixture?mobile-layout&collection=${collection}`,
      );
      const heading = page.locator(".collection-heading");
      const title = await heading.locator("h1").boundingBox();
      const create = await heading.locator(".collection-create").boundingBox();
      expect(
        Math.abs(title!.y + title!.height / 2 - create!.y - create!.height / 2),
      ).toBeLessThan(3);
      const table = page.locator(".responsive-table");
      await expect(table.locator("td[data-label=Date]")).toContainText(
        "2026-10-28",
      );
      expect(
        await table.evaluate((el) => el.scrollWidth <= el.clientWidth),
      ).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.goto("/company-ui-fixture?mobile-layout");
    await page
      .getByRole("button", { name: "Search services", exact: true })
      .click();
    const search = page.getByRole("textbox", { name: "Search services" });
    await expect(search).toBeFocused();
    await search.fill("no match");
    await expect(page.getByText("No matching services")).toBeVisible();
    await search.fill("");
    await search.press("Escape");
    await expect(search).not.toBeVisible();
    await page.getByRole("button", { name: "Filter services" }).click();
    const panel = page.locator(".list-filter-panel");
    const bounds = await panel.boundingBox();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
    await page
      .getByRole("combobox", { name: "services status" })
      .selectOption("active");
    await expect(page.locator(".responsive-table tbody tr")).toHaveCount(1);
    await page.keyboard.press("Escape");
    const overview = page.locator(".content > .heading").last();
    const overviewTitle = await overview.locator("h1").boundingBox();
    const newButton = await overview
      .getByRole("button", { name: "New", exact: true })
      .boundingBox();
    expect(
      Math.abs(
        overviewTitle!.y +
          overviewTitle!.height / 2 -
          newButton!.y -
          newButton!.height / 2,
      ),
    ).toBeLessThan(3);
    if (width === 390)
      await page.screenshot({
        path: ".artifacts/mobile-workspace.png",
        fullPage: true,
      });
  });
}

test("drawer animates both ways and can reopen without stale state", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/company-ui-fixture?mobile-layout");
  const drawer = page.locator(".mobile-navigation");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(drawer).toBeVisible();
  expect(
    await drawer.evaluate((el) => getComputedStyle(el).transitionProperty),
  ).toContain("transform");
  await drawer.evaluate(async (el) => {
    await Promise.all(
      el.getAnimations().map((animation) => animation.finished.catch(() => {})),
    );
  });
  await expect(drawer).toHaveCSS("transform", "none");
  const exit = await drawer.evaluate((el) => {
    (el as HTMLDialogElement).close();
    return {
      open: (el as HTMLDialogElement).open,
      display: getComputedStyle(el).display,
      moving: el.getAnimations().length,
    };
  });
  expect(exit.open).toBe(false);
  expect(exit.display).not.toBe("none");
  expect(exit.moving).toBeGreaterThan(0);
  await expect(drawer).not.toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(drawer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(drawer).toHaveCSS("transition-duration", "0s");
  expect(await drawer.evaluate((el) => el.getAnimations().length)).toBe(0);
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
});

test("menus and notification details retain closing content and reopen", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture");
  const newButton = page.getByRole("button", { name: "New", exact: true });
  await newButton.click();
  const menu = page.locator("#new-record-options");
  await expect(menu).toBeVisible();
  await menu.evaluate(async (el) => {
    await Promise.all(
      el.getAnimations().map((animation) => animation.finished.catch(() => {})),
    );
  });
  await page.keyboard.press("Escape");
  await expect(menu).toHaveAttribute("inert", "");
  await expect(menu).not.toBeVisible();
  await newButton.click();
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  for (let attempt = 0; attempt < 2; attempt++) {
    await page.getByRole("button", { name: "Preview notifications" }).click();
    await page
      .locator("#notification-preview-panel")
      .getByRole("button", { name: /Invoice update 0/ })
      .click();
    const detail = page.getByRole("dialog", { name: "Invoice update 0" });
    await expect(detail).toBeVisible();
    await detail.evaluate(async (el) => {
      await Promise.all(
        el
          .getAnimations()
          .map((animation) => animation.finished.catch(() => {})),
      );
    });
    await detail
      .getByRole("button", { name: "Close notification details" })
      .click();
    const retained = page.locator(".notification-detail-dialog").filter({
      has: page.getByText("Invoice details for preview 0", { exact: true }),
    });
    await expect(retained).toBeAttached();
    await expect(retained).not.toBeVisible();
  }
});

test("opening and dismissing a record does not refresh the entire page", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture");
  await page.getByRole("button", { name: "View draft invoice" }).click();
  await expect(
    page.getByRole("dialog").getByText("Draft invoice", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close dialog", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect(
    await page.evaluate(
      () =>
        (window as typeof window & { fixtureRefreshCount?: number })
          .fixtureRefreshCount || 0,
    ),
  ).toBe(0);
});

test("adds agreed services with discounts inside the company, without a separate packages page", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/company-ui-fixture");
  await expect(
    page.getByRole("link", { name: "Services & Packages", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Add agreed services", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Agreed services name")).toHaveCount(0);
  await dialog
    .locator(".service-multiselect summary")
    .evaluate((el) => el.parentElement?.setAttribute("open", ""));
  await dialog.getByRole("checkbox", { name: "Design", exact: true }).check();
  await dialog.getByLabel("Service quantity 1").fill("2");
  await dialog.getByLabel("Service discount 1", { exact: true }).fill("20");
  await dialog
    .locator(".service-multiselect summary")
    .evaluate((el) => el.parentElement?.setAttribute("open", ""));
  await dialog.getByRole("checkbox", { name: "Setup", exact: true }).check();
  await expect(dialog.getByLabel("Payment frequency 2")).toHaveValue(
    "one-time",
  );
  await dialog.getByRole("button", { name: "Full-service discount" }).click();
  await dialog.getByLabel("Full-service discount", { exact: true }).fill("30");
  await expect(dialog.getByText(/First billing total:/)).toContainText(
    "200.00",
  );
  expect(
    await dialog.evaluate(
      (element) => element.scrollWidth <= element.clientWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".artifacts/agreed-services-mobile.png",
    fullPage: true,
  });
  await dialog.getByRole("button", { name: "Review changes" }).click();
  await dialog
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  const saved = await page.evaluate(
    () =>
      (
        window as unknown as {
          fixtureRow: { items: unknown[]; price: number; discount: number };
        }
      ).fixtureRow,
  );
  expect(saved.items).toHaveLength(2);
  expect(saved.price).toBe(20000);
  expect(saved.discount).toBe(3000);
  await expect(
    dialog.getByRole("link", { name: "Create service invoice" }),
  ).toBeVisible();
});

test("invoice preview automatically loads the company's services and excludes reserved one-time items", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture?agreed-invoice");
  await page.getByRole("button", { name: "New invoice", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Agreed services (optional)")).toHaveCount(0);
  await expect(
    dialog.getByLabel("Tax rate in basis points (100 = 1%)"),
  ).toHaveCount(0);
  await expect(dialog.getByLabel("Description 1")).toHaveValue(
    "Monthly design",
  );
  await expect(dialog.getByLabel("Description 2")).toHaveCount(0);
  await expect(dialog.locator(".summary .grand")).toContainText("162.00");
  await dialog.getByLabel("Discount type").selectOption("percentage");
  await dialog
    .getByRole("spinbutton", { name: "Discount", exact: true })
    .fill("10");
  await expect(dialog.locator(".summary .grand")).toContainText("145.80");
  await dialog
    .getByRole("button", { name: "Review draft", exact: true })
    .click();
  await dialog.getByRole("button", { name: "Save draft", exact: true }).click();
  const saved = await page.evaluate(
    () =>
      (window as unknown as { fixtureRow: { items: { discount: number }[] } })
        .fixtureRow,
  );
  expect(saved.items).toHaveLength(1);
  expect(saved.items[0].discount).toBe(3800);
});

test("selects a sub-service on its own and saves percentage discounts without a separate name", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture");
  await page
    .getByRole("button", { name: "Add agreed services", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByLabel("Agreed services name")).toHaveCount(0);
  await dialog
    .locator(".service-multiselect summary")
    .evaluate((el) => el.parentElement?.setAttribute("open", ""));
  await dialog.getByRole("checkbox", { name: "Setup", exact: true }).check();
  await expect(dialog.locator("fieldset")).toHaveCount(1);
  await expect(dialog.locator("legend")).toHaveText("Setup");
  await dialog
    .getByLabel("Service discount 1 type", { exact: true })
    .selectOption("percentage");
  await dialog.getByLabel("Service discount 1", { exact: true }).fill("20");
  await dialog.getByRole("button", { name: "Full-service discount" }).click();
  await dialog
    .getByLabel("Full-service discount type", { exact: true })
    .selectOption("percentage");
  await dialog.getByLabel("Full-service discount", { exact: true }).fill("10");
  await expect(dialog.getByText(/First billing total:/)).toContainText("36.00");
  const discountBox = await dialog
    .locator(".service-discount-frequency .discount-field")
    .boundingBox();
  const frequencyBox = await dialog
    .getByLabel("Payment frequency 1")
    .boundingBox();
  expect(discountBox!.x).toBeLessThan(frequencyBox!.x);
  await dialog.getByRole("button", { name: "Review changes" }).click();
  await dialog
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  const saved = await page.evaluate(
    () =>
      (
        window as unknown as {
          fixtureRow: {
            name: string;
            discount_type: string;
            discount_value: number;
            price: number;
            items: { discount_type: string; discount_value: number }[];
          };
        }
      ).fixtureRow,
  );
  expect(saved).toMatchObject({
    name: "Setup",
    discount_type: "percentage",
    discount_value: 1000,
    price: 3600,
  });
  expect(saved.items[0]).toMatchObject({
    discount_type: "percentage",
    discount_value: 2000,
  });
});

test("catalogue nests sub-services and confirms deletion", async ({ page }) => {
  await page.goto("/company-ui-fixture?service-tree");
  await expect(page.locator(".service-card")).toHaveCount(1);
  await page.getByRole("button", { name: "Open Website", exact: true }).click();
  await expect(page.locator(".sub-service-row")).toContainText("Hosting");
  await page.getByLabel("Actions for Hosting").click();
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Delete Hosting" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("button", { name: "Cancel" }).click();
  await expect(dialog).not.toBeVisible();
});

test("sub-service editor preserves its parent and groups pricing fields", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture?service-editor");
  await expect(page.getByLabel("Main service", { exact: true })).toHaveValue(
    "10000000-0000-4000-8000-000000000020",
  );
  await expect(page.getByLabel("Archive service")).toHaveCount(0);
  const frequency = await page.getByLabel("Payment frequency").boundingBox();
  const rate = await page.getByLabel("Default rate").boundingBox();
  const currency = await page
    .getByLabel("Currency", { exact: true })
    .boundingBox();
  expect(Math.abs(frequency!.y - rate!.y)).toBeLessThanOrEqual(1);
  expect(rate?.y).toBe(currency?.y);
  await page.getByLabel("Service name").fill("Hosting");
  await page.getByLabel("Default rate").fill("100");
  await page.getByRole("button", { name: "Review changes" }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { fixtureService: { parent_id: string } })
            .fixtureService?.parent_id,
      ),
    )
    .toBe("10000000-0000-4000-8000-000000000020");
});

test("invoice tracker hands the received amount to company payments", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture?invoice-tracker");
  await page
    .getByRole("button", { name: "Track INV-030", exact: true })
    .click();
  await page
    .locator(".tracker-menu:popover-open")
    .getByRole("button", { name: "To collect", exact: true })
    .click();
  await expect(page.getByText("Sent: 2026-10-29")).toBeVisible();
  const tracker = page.getByRole("dialog", {
    name: "Invoice tracker",
    exact: true,
  });
  await expect(tracker).toBeVisible();
  await expect(
    page.getByRole("columnheader", { name: "Company", exact: true }),
  ).toHaveCount(0);
  await tracker.getByLabel("Update invoice").selectOption("payment");
  await tracker
    .getByRole("button", { name: "Record payment", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "Record payment",
    exact: true,
  });
  await expect(dialog.getByLabel("Invoice number")).toHaveValue("INV-030");
  await expect(dialog.getByLabel("Full invoice amount")).toHaveValue("200.00");
  await expect(dialog.getByLabel("Amount received")).toHaveValue("200.00");
  await expect(dialog.getByLabel("Agreed services (optional)")).toHaveCount(0);
  await expect(dialog.getByLabel("Bank or transaction reference")).toHaveCount(
    0,
  );
  // Measure the row in one browser frame; sequential boundingBox calls can
  // sample different positions while the dialog opening animation is running.
  await expect
    .poll(() =>
      dialog
        .locator("#currency, #invoice_total, #amount")
        .evaluateAll((fields) => {
          if (fields.length !== 3) return false;
          const tops = fields.map((field) => field.getBoundingClientRect().top);
          return Math.max(...tops) - Math.min(...tops) < 0.5;
        }),
    )
    .toBe(true);
  await dialog.getByLabel("Method", { exact: true }).selectOption("cheque");
  await dialog.getByLabel("Amount received").fill("250");
  await dialog.getByRole("button", { name: "Review changes" }).click();
  await dialog
    .getByRole("button", { name: "Save changes", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { fixtureNavigation: string })
            .fixtureNavigation,
      ),
    )
    .toContain("?section=payments&record=");
  const saved = await page.evaluate(
    () =>
      (
        window as unknown as {
          fixtureRow: { amount: number; reference: string };
        }
      ).fixtureRow,
  );
  expect(saved.amount).toBe(25000);
  expect(saved.reference).toBe("INV-030");
});

test("tracker popup marks an invoice sent without delivery channel choices", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture?invoice-tracker&unsent");
  await page
    .getByRole("button", { name: "Track INV-030", exact: true })
    .click();
  await page
    .locator(".tracker-menu:popover-open")
    .getByRole("button", { name: "To collect", exact: true })
    .click();
  const tracker = page.getByRole("dialog", {
    name: "Invoice tracker",
    exact: true,
  });
  await tracker.getByLabel("Update invoice").selectOption("sent");
  await expect(tracker.getByLabel("Delivery channel")).toHaveCount(0);
  await expect(tracker.getByText("WhatsApp", { exact: true })).toHaveCount(0);
  await tracker.getByRole("button", { name: "Review mark as sent" }).click();
  await tracker
    .getByRole("button", { name: "Mark as sent", exact: true })
    .click();
  await expect(tracker.getByText("Invoice marked as sent.")).toBeVisible();
  await tracker.getByRole("button", { name: "Close invoice tracker" }).click();
  await expect(tracker).not.toBeVisible();
});

test("header popovers toggle closed on repeated pointer and keyboard activation", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture");
  for (const [label, selector] of [
    ["Preview notifications", "#notification-preview-panel"],
    ["Workspace settings", "#workspace-settings-menu"],
  ]) {
    const trigger = page.getByRole("button", { name: label });
    const panel = page.locator(selector);
    await trigger.click();
    await expect(panel).toBeVisible();
    await trigger.click();
    await expect(panel).not.toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(panel).toBeVisible();
    await page.keyboard.press("Space");
    await expect(panel).not.toBeVisible();
  }
  await page.getByRole("button", { name: "Preview notifications" }).click();
  await page.getByRole("button", { name: "Workspace settings" }).click();
  await expect(page.locator("#notification-preview-panel")).not.toBeVisible();
  await expect(page.locator("#workspace-settings-menu")).toBeVisible();
  await page.getByRole("heading", { name: "Company workspace" }).click();
  await expect(page.locator("#workspace-settings-menu")).not.toBeVisible();
});

test("dashboard amounts fit on one line at desktop and mobile widths", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture?metric-fit");
  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const amount of await page.locator(".metric-amount").all()) {
      await expect
        .poll(() =>
          amount.evaluate((el) => {
            const span = el.firstElementChild!;
            const range = document.createRange();
            range.selectNodeContents(span);
            return (
              span.getBoundingClientRect().width <= el.clientWidth + 1 &&
              range.getClientRects().length === 1
            );
          }),
        )
        .toBe(true);
    }
  }
});

test("workbook package suggestions fill editable details and preserve the selected parent", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture?service-editor");
  await page
    .getByText("Start from your service workbook", { exact: true })
    .click();
  await page
    .getByLabel("Service category")
    .selectOption({ label: "Account service" });
  await page
    .getByLabel("Workbook suggestion")
    .selectOption({ label: "Standard" });
  await page.getByRole("button", { name: "Use suggestion" }).click();
  await expect(page.getByLabel("Service name")).toHaveValue("Standard");
  await expect(page.getByLabel("Default rate")).toHaveValue("45000.00");
  await expect(page.getByLabel("Description", { exact: true })).toContainText(
    "Monthly APIT Handling",
  );
  await expect(page.getByLabel("Main service", { exact: true })).toHaveValue(
    "10000000-0000-4000-8000-000000000020",
  );
  await page.getByRole("button", { name: "Review changes" }).click();
  await expect(
    page.getByRole("dialog").getByText("Website", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("dialog").locator("select")).toHaveCount(0);
});

test("workbook variable prices require an explicit rate and currency changes clear LKR pricing", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture?service-editor");
  await page
    .getByText("Start from your service workbook", { exact: true })
    .click();
  await page
    .getByLabel("Workbook suggestion")
    .selectOption({ label: "Startup" });
  await page.getByRole("button", { name: "Use suggestion" }).click();
  await expect(page.getByLabel("Default rate")).toHaveValue("");
  await page.getByRole("button", { name: "Review changes" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByLabel("Default rate").fill("3500");
  await page.getByLabel("Currency", { exact: true }).selectOption("USD");
  await expect(page.getByLabel("Default rate")).toHaveValue("");
  await page.setViewportSize({ width: 320, height: 900 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("owner dashboard prioritises collections and sales without a notification card", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/company-ui-fixture?overview-design");
  await expect(
    page.getByRole("heading", { name: "Collect these first" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Proposals awaiting a decision" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Latest notifications" }),
  ).toHaveCount(0);
  await expect(page.locator(".metric-amount").first()).toHaveText("LKR 2.45M");
  await expect(
    page.getByRole("link", { name: /Harbour Trading.*INV-001/ }),
  ).toHaveAttribute("href", "/invoices/late");
  await expect(
    page.locator(
      ".overview-exact, .overview-actions, .overview-footnote, .sales-footer",
    ),
  ).toHaveCount(0);
  await expect(page.locator(".ledger-overview .eyebrow")).toHaveCount(0);
  const invoicesLink = page.getByRole("link", {
    name: "View invoices",
    exact: true,
  });
  await expect(invoicesLink).toHaveAttribute("href", "/invoices");
  await expect(
    page.getByRole("link", { name: "View proposals", exact: true }),
  ).toHaveAttribute("href", "/proposals");
  await invoicesLink.hover();
  await expect(invoicesLink).toHaveCSS(
    "background-color",
    "rgb(237, 245, 255)",
  );
  await expect(invoicesLink).toHaveCSS("border-radius", "12px");
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({
    path: ".artifacts/ledger-dashboard-desktop.png",
    fullPage: true,
    animations: "disabled",
  });
  for (const width of [390, 320]) {
    await page.setViewportSize({ width, height: 844 });
    await expect
      .poll(() =>
        page.evaluate(() =>
          Array.from(document.querySelectorAll("main *"))
            .filter((el) => el.getBoundingClientRect().right > innerWidth + 1)
            .map((el) => ({
              tag: el.tagName,
              cls: el.className,
              right: el.getBoundingClientRect().right,
            })),
        ),
      )
      .toEqual([]);
  }
  await page.screenshot({
    path: ".artifacts/ledger-dashboard-mobile.png",
    fullPage: true,
    animations: "disabled",
  });
});

test("service deletion is centered, fits mobile and restores focus", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture?service-tree");
  await page.getByRole("button", { name: "Open Website", exact: true }).click();
  for (const width of [1440, 320]) {
    await page.setViewportSize({ width, height: 900 });
    const trigger = page.getByLabel("Actions for Hosting");
    await trigger.click();
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    const modal = page.getByRole("dialog", { name: "Delete Hosting" });
    const rect = await modal.boundingBox();
    expect(rect!.width).toBeLessThanOrEqual(Math.min(462, width - 30));
    expect(Math.abs(rect!.x + rect!.width / 2 - width / 2)).toBeLessThan(2);
    expect(Math.abs(rect!.y + rect!.height / 2 - 450)).toBeLessThan(2);
    await expect(modal.getByRole("button", { name: "Cancel" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
  }
});

test("catalogue drawer keeps browsing and editing in one panel", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture?service-tree");
  await expect(
    page.locator(
      ".workbook-catalogue, .service-description, .sub-service-desc",
    ),
  ).toHaveCount(0);
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
  await page.setViewportSize({ width: 1440, height: 900 });
  const columns = await page
    .locator(".services-catalogue-grid")
    .evaluate(
      (el) => getComputedStyle(el).gridTemplateColumns.split(" ").length,
    );
  expect(columns).toBe(4);
  const card = page.getByRole("button", { name: "Open Website", exact: true });
  await card.click();
  const drawer = page.locator(".service-drawer");
  await expect(drawer).toBeVisible();
  await drawer.getByRole("button", { name: /Hosting LKR/ }).click();
  await expect(
    drawer.getByRole("heading", { name: "Hosting", exact: true }),
  ).toBeFocused();
  await drawer
    .getByRole("button", { name: "Edit sub-service", exact: true })
    .click();
  await page.evaluate(() => {
    (
      window as unknown as { fixtureServiceError: boolean }
    ).fixtureServiceError = true;
  });
  await page.getByLabel("Service name").fill("Managed hosting");
  await page.getByLabel("Default rate").fill("250");
  await page.getByRole("button", { name: "Review changes" }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    drawer.getByText("Unable to save service.", { exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    (
      window as unknown as { fixtureServiceError: boolean }
    ).fixtureServiceError = false;
  });
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    drawer.getByRole("heading", { name: "Managed hosting", exact: true }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { fixtureService: { rate: number } })
            .fixtureService.rate,
      ),
    )
    .toBe(25000);
  await drawer.getByRole("button", { name: "Back", exact: true }).click();
  await expect(
    drawer.getByRole("button", { name: /Managed hosting LKR/ }),
  ).toBeVisible();
  await drawer
    .getByRole("button", { name: "Add sub-service", exact: true })
    .click();
  await expect(page.getByLabel("Main service", { exact: true })).toHaveValue(
    "parent",
  );
  await page.getByLabel("Service name").fill("Support");
  await page.getByLabel("Default rate").fill("500");
  await page.getByRole("button", { name: "Review changes" }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    drawer.getByRole("heading", { name: "Support", exact: true }),
  ).toBeVisible();
  await page.setViewportSize({ width: 320, height: 844 });
  await expect
    .poll(async () => (await drawer.boundingBox())!.width)
    .toBeLessThanOrEqual(320);
  await page.screenshot({ path: ".artifacts/services-drawer-mobile.png" });
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await expect(card).toBeFocused();
  await expect(page).toHaveURL(/service-tree$/);
});

test("notification dot clears after viewing and stays cleared after reload", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture");
  await expect(page.locator(".notification-new-dot")).toBeVisible();
  await page.getByRole("button", { name: "Preview notifications" }).click();
  await expect(page.locator(".notification-new-dot")).toHaveCount(0);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Preview notifications" }),
  ).toBeVisible();
  await expect(page.locator(".notification-new-dot")).toHaveCount(0);
});

test("unpriced imported services can be explicitly activated after pricing", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture?service-editor&inactive");
  await expect(page.getByLabel("Service status")).toHaveValue("archived");
  await page.getByLabel("Service name").fill("Payroll");
  await page.getByLabel("Default rate").fill("3500");
  await page.getByLabel("Service status").selectOption("active");
  await page.getByRole("button", { name: "Review changes" }).click();
  await expect(
    page.getByRole("dialog").getByText("Active", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window as unknown as { fixtureService: { archived: boolean } })
            .fixtureService?.archived,
      ),
    )
    .toBe(false);
});

test("compact catalogue filters and service form layout", async ({ page }) => {
  await page.goto("/company-ui-fixture?service-tree");
  await expect(
    page.locator(".service-card .service-icon, .services-toolbar"),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Filter services", exact: true })
    .click();
  await page.getByLabel("Status", { exact: true }).selectOption("archived");
  await expect(
    page.getByText("No matching services", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Status", { exact: true }).selectOption("all");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Open Website", exact: true }).click();
  await page.getByLabel("Actions for Website", { exact: true }).click();
  const remove = page.locator(
    ".service-actions-popover:popover-open .service-delete-option",
  );
  await remove.hover();
  await expect(remove).toHaveCSS("background-color", "rgb(255, 240, 241)");
  await expect(remove).toHaveCSS("text-align", "left");
  await page
    .locator(".service-actions-popover:popover-open")
    .getByRole("button", { name: "Edit", exact: true })
    .click();
  const boxes = await page
    .locator("#name, #parent_id, #service_status, #rate, #currency")
    .evaluateAll((nodes) =>
      Object.fromEntries(
        nodes.map((n) => {
          const r = n.getBoundingClientRect();
          return [n.id, { x: r.x, y: r.y, width: r.width }];
        }),
      ),
    );
  expect(boxes.parent_id.y).toBe(boxes.service_status.y);
  expect(boxes.name.width).toBeGreaterThan(boxes.parent_id.width * 1.8);
  expect(boxes.currency.x).toBeLessThan(boxes.rate.x);
  await page.screenshot({
    path: ".artifacts/service-editor-layout.png",
    animations: "disabled",
  });
});

test("invoice overview stays compact, issue actions align, and tracking filters live stages", async ({
  page,
}) => {
  await page.goto("/company-ui-fixture?invoice-layout");
  const preview = page.locator(".invoice-preview-card");
  expect((await preview.boundingBox())!.height).toBeLessThanOrEqual(400);
  const issue = await page
    .getByRole("button", { name: "Review issue invoice", exact: true })
    .boundingBox();
  const view = await page
    .getByRole("link", { name: "Preview document", exact: true })
    .boundingBox();
  expect(Math.abs(issue!.y - view!.y)).toBeLessThan(2);
  await expect(page.getByText("Available after issuing.")).not.toBeVisible();
  await page.getByLabel("Tracking stage").selectOption("settled");
  await expect(
    page.getByRole("link", { name: "INV-001", exact: true }),
  ).toBeVisible();
  await page.getByLabel("Tracking stage").selectOption("collect");
  await expect(page.getByText("No invoices in this stage.")).toBeVisible();
  await page.screenshot({
    path: ".artifacts/invoice-overview-compact.png",
    fullPage: true,
  });
});

test("notifications use sidebar search and retain read state after opening the record drawer", async ({
  page,
}) => {
  await page.route("**/api/notifications/record?**", (route) =>
    route.fulfill({
      json: {
        details: [
          { label: "name", value: "Hosting" },
          { label: "rate", value: "LKR 120.00" },
        ],
      },
    }),
  );
  await page.goto("/company-ui-fixture?notification-feed");
  await expect(
    page.getByRole("navigation", { name: "Activity categories" }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Search notifications" })
    .fill("Hosting");
  await expect(page.locator(".activity-row")).toHaveCount(1);
  await expect(page.locator(".activity-row.notification-unread")).toHaveCount(
    1,
  );
  await page.locator(".activity-row").click();
  const drawer = page.getByRole("dialog");
  await expect(drawer.getByText("LKR 120.00")).toBeVisible();
  await expect(page.locator(".activity-row.notification-unread")).toHaveCount(
    0,
  );
  await expect.poll(async () => { const box = (await drawer.boundingBox())!; return Math.round(box.x + box.width); }).toBe(page.viewportSize()!.width);
  await page.screenshot({ path: ".artifacts/notification-record-drawer.png", animations: "disabled" });
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.locator(".activity-row.notification-unread")).toHaveCount(
    1,
  );
});
