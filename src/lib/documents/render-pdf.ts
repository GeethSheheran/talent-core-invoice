import "server-only";
import puppeteer from "puppeteer-core";
import { browserOptions } from "@/lib/documents/browser";
import { readFile } from "node:fs/promises";
import { createElement } from "react";
import { snapshotSchema, type Snapshot } from "@/lib/documents/snapshots";
import { Document } from "@root/templates/documents/document";
export interface PdfRenderer {
  render(snapshot: Snapshot): Promise<Uint8Array>;
}
export class ChromiumRenderer implements PdfRenderer {
  async render(input: Snapshot) {
    const snapshot = snapshotSchema.parse(input);
    const browser = await puppeteer.launch(await browserOptions());
    try {
      const page = await browser.newPage();
      await page.setJavaScriptEnabled(false);
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (
          request.url().startsWith("data:") ||
          request.url() === "about:blank"
        )
          void request.continue();
        else void request.abort();
      });
      const { renderToStaticMarkup } = await import("react-dom/server");
      const css = (
        await readFile(process.cwd() + "/src/app/globals.css", "utf8")
      ).replace('@import "tailwindcss";', "");
      const fonts = snapshot.brand.fontData
        ? `@font-face{font-family:DocumentFont;src:url("${snapshot.brand.fontData}")}`
        : "";
      await page.setContent(
        '<!doctype html><html><head><meta charset="utf-8"><style>' +
          css +
          fonts +
          "</style></head><body>" +
          renderToStaticMarkup(createElement(Document, { snapshot })) +
          "</body></html>",
        { waitUntil: "load" },
      );
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all(
          [...document.images].map((img) =>
            img.decode().catch(() => undefined),
          ),
        );
      });
      return await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: true,
        headerTemplate: "<span></span>",
        footerTemplate:
          '<div style="width:100%;text-align:center;font-size:9px;color:#777"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
        margin: { top: "16mm", bottom: "18mm", left: "16mm", right: "16mm" },
      });
    } finally {
      await browser.close();
    }
  }
}
export const pdfRenderer: PdfRenderer = new ChromiumRenderer();
