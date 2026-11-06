import { templateProposal } from "../../src/lib/proposals/template";
import { extractSource } from "../../src/lib/proposals/extract";
import { it, expect } from "vitest";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { pdfRenderer } from "../../src/lib/documents/render-pdf";
import { snapshotSchema } from "../../src/lib/documents/snapshots";
import { brand } from "../fixtures/billing";
it("renders trusted multi-page invoices and proposals with selectable text", async () => {
  await mkdir(".artifacts", { recursive: true });
  const base = {
    brand,
    business: {
      name: "Fictional Studio",
      address: "Colombo, Sri Lanka",
      email: "studio@example.test",
      bank_details: "Test bank — fictional account",
      notes: "Please include the invoice number with your payment.",
    },
    company: {
      name: "Fictional Company",
      code: "CMP-0001",
      address: "Test address, Colombo",
      email: "client@example.test",
      currency: "LKR",
    },
  };
  const invoice = snapshotSchema.parse({
    ...base,
    kind: "invoice",
    invoice: {
      number: "INV-CMP0001-2026-00001",
      currency: "LKR",
      issued_at: "2026-10-13T00:00:00Z",
      due_date: "2026-10-27",
      period: "2026-10-01",
      subtotal: 7000000,
      discount: 0,
      tax: 0,
      total: 7000000,
      notes: "Final note: all seventy service rows must be visible.",
    },
    items: Array.from({ length: 70 }, (_, i) => ({
      description: `Service ${i + 1}: A long description of the monthly services, reporting and delivery support. This content must wrap without clipping.`,
      quantity: "1",
      rate: 100000,
      amount: 100000,
    })),
    references: [{ number: "INV-CMP0001-2026-00000", amount: 1000000 }],
  });
  const compact = snapshotSchema.parse({
    ...invoice,
    invoice: {
      ...invoice.invoice,
      subtotal: 800000,
      total: 800000,
      notes: "Please quote the invoice number.",
    },
    references: [],
    items: invoice.items!.slice(0, 8).map((item, i) => ({
      ...item,
      description: `Service ${i + 1}: Design and support`,
    })),
  });
  const puppeteer = (await import("puppeteer-core")).default;
  const { browserOptions } = await import("../../src/lib/documents/browser");
  const { renderToStaticMarkup } = await import("react-dom/server");
  const { createElement } = await import("react");
  const { Document } = await import("../../templates/documents/document");
  const browser = await puppeteer.launch(await browserOptions());
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 1200 });
    const css = (await readFile("src/app/globals.css", "utf8")).replace(
      '@import "tailwindcss";',
      "",
    );
    await page.setContent(
      `<style>${css}</style>${renderToStaticMarkup(createElement(Document, { snapshot: compact }))}`,
    );
    expect(
      await page.$$eval(".invoice-doc-items td:not(:first-child)", (cells) =>
        cells.every((cell) => cell.scrollWidth <= cell.clientWidth),
      ),
    ).toBe(true);
    await page.screenshot({
      path: ".artifacts/eight-services-invoice.png",
      fullPage: true,
    });
  } finally {
    await browser.close();
  }
  const compactPdf = await pdfRenderer.render(compact);
  const { getDocumentProxy } = await import("unpdf");
  const compactDocument = await getDocumentProxy(new Uint8Array(compactPdf));
  expect(compactDocument.numPages).toBe(1);
  await compactDocument.loadingTask.destroy();
  await writeFile(".artifacts/eight-services-invoice.pdf", compactPdf);
  const draftReceipt = snapshotSchema.parse({...base,kind:"receipt",payment:{receipt_number:null,currency:"LKR",amount:10000,received_on:"2026-11-06",method:"bank",reference:"INV-001"},allocations:[],unallocated:10000});
  const receiptPdf=await pdfRenderer.render(draftReceipt);
  const receiptDoc=await getDocumentProxy(new Uint8Array(receiptPdf));
  expect(receiptDoc.numPages).toBe(1);
  await receiptDoc.loadingTask.destroy();
  const receiptText=await extractSource(new File([new Uint8Array(receiptPdf)],"receipt.pdf"));
  expect(receiptText).toContain("Draft receipt");
  expect(receiptText).toContain("does not acknowledge receipt");
  await writeFile(".artifacts/draft-receipt-a4.pdf",receiptPdf);
  const pdf = await pdfRenderer.render(invoice);
  expect(Buffer.from(pdf).subarray(0, 5).toString()).toBe("%PDF-");
  expect(pdf.length).toBeGreaterThan(10000);
  const text = await extractSource(
    new File([new Uint8Array(pdf)], "invoice.pdf"),
  );
  expect(text).toContain("Service 70");
  expect(text).toContain("INV-CMP0001-2026-00001");
  await writeFile(".artifacts/long-invoice.pdf", pdf);
  const proposal = snapshotSchema.parse({
    ...base,
    kind: "proposal",
    proposal: {
      number: "PRO-CMP0001-2026-00001",
      title: "A considered approach to your project",
      currency: "LKR",
      price: 12000000,
      brief: {
        payment_schedule:
          "40% advance, remaining amount at the agreed milestone.",
        exclusions: "Third-party subscriptions are excluded.",
        maintenance: "Maintenance is agreed separately.",
        future_options: "Additional integrations may be scoped later.",
      },
      sections: Array.from({ length: 10 }, (_, i) => ({
        title: "Delivery stage " + (i + 1),
        body: "We will work with your team to clarify the requirements and deliver the agreed outcomes. The scope remains limited to the approved brief. ".repeat(
          12,
        ),
      })),
    },
  });
  await writeFile(
    ".artifacts/long-proposal.pdf",
    await pdfRenderer.render(proposal),
  );
  const template = templateProposal(
    "Create a catalogue website with a contact form and a clear overview of the company services.",
  );
  const templateSnapshot = snapshotSchema.parse({
    ...proposal,
    proposal: {
      ...proposal.proposal,
      number: null,
      sections: template.sections,
      brief: template.brief,
    },
  });
  const templatePdf = await pdfRenderer.render(templateSnapshot);
  const templateText = await extractSource(
    new File([new Uint8Array(templatePdf)], "proposal-draft.pdf"),
  );
  expect(templateText).toContain("DRAFT");
  expect(templateText).toContain("catalogue website");
  expect(templateText).toContain("Not issued or accepted");
  await writeFile(".artifacts/template-proposal-draft.pdf", templatePdf);
}, 60000);
