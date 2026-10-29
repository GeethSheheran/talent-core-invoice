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
      import { SettingsMenu } from "./src/components/layout/settings-menu";
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
      function NavigationFixture() { const [selected, setSelected] = useState("overview"); return <div><div className="workspace-tools"><SettingsMenu /></div><aside className="company-sidebar" style={{ width: 240 }}><CompanySectionNav companyId="10000000-0000-4000-8000-000000000001" selected={selected} onNavigate={() => setSelected("expenses")} /></aside></div>; }
      createRoot(document.getElementById("root")).render(location.search.includes("invoice-tracker") ? <RecordsTable hideCompany collection="invoices" rows={[{id: "10000000-0000-4000-8000-000000000030", company_id: "10000000-0000-4000-8000-000000000001", number: "INV-030", currency: "LKR", total: 20000, state: "issued", first_sent_on: location.search.includes("unsent") ? null : "2026-10-29"}]} /> : location.search.includes("service-editor") ? <main><RecordEditor kind="service" onSave={async (form) => { window.fixtureService = JSON.parse(form.get("payload")); return ""; }} initial={{parent_id: "10000000-0000-4000-8000-000000000020", currency: "LKR"}} services={[{id: "10000000-0000-4000-8000-000000000020", name: "Website", currency: "LKR", rate: 10000}]} /></main> : location.search.includes("service-tree") ? <main><ServicesList rows={[{id: "parent", name: "Website", rate: 10000, currency: "LKR"}, {id: "child", parent_id: "parent", name: "Hosting", rate: 1000, currency: "LKR"}]} /></main> : location.search.includes("mobile-layout") ? <div className="shell"><Sidebar /><div><header className="workspace-bar"><MobileNavigation /><a href="/dashboard" className="workspace-identity">Ledger <WorkspaceTitle /></a><div className="workspace-tools"><NotificationMenu /><SettingsMenu /></div></header><main className="content"><CollectionList collection={new URLSearchParams(location.search).get("collection") || "services"} rows={[{id: "service-1", name: "Web development", number: "INV-CMP0001-2026-00001", company_id: "company", rate: 12000000, currency: "LKR", active: true, created_at: "2026-10-28"}]} companies={{company: "Example company"}} /><div className="heading"><h1>Overview</h1><div className="actions"><NewMenu /></div></div></main></div></div> : <main className="content"><header className="workspace-bar"><span>Ledger <WorkspaceTitle /></span><div className="workspace-tools"><NotificationMenu /></div></header><h1>Company workspace</h1><NavigationFixture /><NewMenu /><CompanyRecordDialog companyId="10000000-0000-4000-8000-000000000001" collection="projects" /><CompanyRecordDialog companyId="10000000-0000-4000-8000-000000000001" collection="payments" /><CompanyRecordDialog companyId="10000000-0000-4000-8000-000000000001" collection="invoices" /><CompanyRecordDialog companyId="10000000-0000-4000-8000-000000000001" collection="invoices" recordId="10000000-0000-4000-8000-000000000002" label="View draft invoice" /><section aria-label="Service catalogue"><RecordsTable collection="services" rows={[{id: "service-1", name: "Web development", rate: 12000, currency: "LKR", active: true}]} /></section><div className="grid dashboard-activity-grid"><section className="card dashboard-billing"><div className="heading"><h2>Billing activity</h2></div><BillingChart months={[{month: "2026-10", issued: 12000, collected: 6000, issuedCompanies: 1, collectedCompanies: 1}]} currency="LKR" /><p className="chart-legend">Issued charges</p></section><section className="card dashboard-notifications"><div className="heading"><h2>Latest notifications</h2></div><NotificationPreview items={Array.from({length: 5}, (_, index) => ({id: "layout-" + index, title: "Invoice update", message: "Invoice saved", status: "recorded", date: "2026-10-27T10:00:00Z", category: "changes", company: "Test Company", record: "INV-001", href: "/invoices/invoice"}))} /></section></div></main>);`,
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
        export async function deleteService() { return ""; }
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
    .getByLabel("Add agreed service")
    .selectOption("10000000-0000-4000-8000-000000000003");
  await dialog.getByLabel("Service quantity 1").fill("2");
  await dialog.getByLabel("Service discount 1", { exact: true }).fill("20");
  await dialog
    .getByLabel("Add agreed service")
    .selectOption("10000000-0000-4000-8000-000000000004");
  await expect(dialog.getByLabel("Payment frequency 2")).toHaveValue(
    "one-time",
  );
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
    .getByLabel("Add agreed service")
    .selectOption("10000000-0000-4000-8000-000000000004");
  await expect(dialog.locator("fieldset")).toHaveCount(1);
  await expect(dialog.locator("legend")).toHaveText("Setup");
  await dialog
    .getByLabel("Service discount 1 type", { exact: true })
    .selectOption("percentage");
  await dialog.getByLabel("Service discount 1", { exact: true }).fill("20");
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
  expect(frequency?.y).toBe(rate?.y);
  expect(rate?.y).toBe(currency?.y);
  await page.getByLabel("Service name").fill("Hosting");
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
  await page.getByText("Track invoice", { exact: true }).click();
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
  const currency = await dialog
    .getByLabel("Currency", { exact: true })
    .boundingBox();
  const full = await dialog.getByLabel("Full invoice amount").boundingBox();
  const received = await dialog.getByLabel("Amount received").boundingBox();
  expect(currency?.y).toBe(full?.y);
  expect(full?.y).toBe(received?.y);
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
    .getByRole("button", { name: "Track invoice", exact: true })
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
