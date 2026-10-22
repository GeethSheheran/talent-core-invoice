import { test, expect } from "@playwright/test";
test("shows setup or sign-in without exposing billing data", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("heading", { name: "Welcome to your workspace" }),
  ).toBeVisible();
  await expect(
    page
      .getByText("Connect your workspace")
      .or(page.getByLabel("Email address")),
  ).toBeVisible();
});
test("protects direct administrator routes", async ({ page }) => {
  for (const path of [
    "/dashboard",
    "/companies",
    "/invoices/new",
    "/expenses",
    "/expenses/new",
    "/agreements/new",
    "/payments",
    "/settings",
    "/proposals",
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/);
  }
});
test("protects document and financial HTTP operations", async ({ request }) => {
  const id = "10000000-0000-4000-8000-000000000001";
  for (const path of [
    `/api/invoices/${id}/pdf`,
    `/api/invoices/${id}/send`,
    `/api/payments/${id}/receipt`,
    `/api/proposals/${id}/pdf`,
    `/api/proposals/${id}/draft`,
    "/api/proposals/draft",
    "/api/proposals/import",
    "/api/proposals/draft-pdf",
  ])
    expect((await request.post(path)).status()).toBe(401);
  expect((await request.get(`/api/documents/${id}/download`)).status()).toBe(
    401,
  );
  expect((await request.get(`/api/companies/${id}/statement`)).status()).toBe(
    401,
  );
  expect((await request.get("/api/cron/daily")).status()).toBe(401);
  expect(
    (await request.post("/api/webhooks/email", { data: "{}" })).status(),
  ).toBe(503);
});
test("setup remains usable at a mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/login");
  await expect(page.getByRole("heading")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: ".artifacts/setup-mobile.png",
    fullPage: true,
  });
});
