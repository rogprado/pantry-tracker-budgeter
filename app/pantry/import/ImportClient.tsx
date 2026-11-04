"use client";

import { CircleAlert, CircleCheck, Download, FileSpreadsheet, PackagePlus, Upload } from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { useState, useTransition } from "react";
import { importItems, type ImportOutcome } from "@/app/pantry/import/actions";
import { Button, ButtonLink, StatusPill } from "@/app/components/ui";
import { MAX_ROWS, checkRow, tableToRows, type CheckedRow } from "@/lib/importRows";

// Reads the file in the browser (nothing is uploaded until you press Import).
async function readTable(file: File): Promise<unknown[][]> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx")) {
    const { readSheet } = await import("read-excel-file/browser");
    return (await readSheet(file)) as unknown[][];
  }
  if (name.endsWith(".csv") || file.type === "text/csv") {
    const text = await file.text();
    return Papa.parse<string[]>(text, { skipEmptyLines: "greedy" }).data;
  }
  if (name.endsWith(".xls")) throw new Error("Old .xls files aren't supported. In Excel, choose File → Save As → Excel Workbook (.xlsx) or CSV.");
  throw new Error("Please choose a .csv or .xlsx file.");
}

export default function ImportClient({ existingNames }: { existingNames: string[] }) {
  const existing = new Set(existingNames.map((n) => n.trim().toLowerCase()));
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<CheckedRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<ImportOutcome[] | null>(null);
  const [pending, startTransition] = useTransition();

  const valid = rows?.filter((r) => r.row) ?? [];
  const invalid = rows?.filter((r) => !r.row) ?? [];

  async function onFile(file: File | undefined) {
    setError(null);
    setRows(null);
    setOutcomes(null);
    if (!file) return;
    setFileName(file.name);
    try {
      const { rows: raw, missingColumns } = tableToRows(await readTable(file));
      if (missingColumns.length) {
        setError(`This file is missing the column${missingColumns.length > 1 ? "s" : ""} ${missingColumns.join(", ")}. Start from the template to get the headers right.`);
        return;
      }
      if (raw.length === 0) return setError("The file has headers but no rows to import.");
      if (raw.length > MAX_ROWS) return setError(`That's ${raw.length} rows; the limit is ${MAX_ROWS}. Please split the file.`);
      setRows(raw.map(({ line, raw: r }) => checkRow(line, r)));
    } catch (e) {
      setError(e instanceof Error && e.message.includes(".") ? e.message : "We couldn't read that file. Is it a .csv or .xlsx spreadsheet?");
    }
  }

  const doImport = () =>
    startTransition(async () => {
      const result = await importItems(valid.map(({ line, raw }) => ({ line, raw })));
      if (result.error) setError(result.error);
      else setOutcomes(result.outcomes);
    });

  // ---------- after importing ----------
  if (outcomes) {
    const count = (s: ImportOutcome["status"]) => outcomes.filter((o) => o.status === s).length;
    return (
      <section className="space-y-5">
        <div className="rounded-card border border-lavender-200 bg-white p-6">
          <h2 className="font-display flex items-center gap-2 text-2xl text-eggplant">
            <CircleCheck size={22} className="text-fresh-ink" aria-hidden="true" /> Import finished
          </h2>
          <p className="mt-2 text-base text-muted">
            {count("created")} new {count("created") === 1 ? "item" : "items"} added · {count("added")} topped up
            {count("failed") > 0 && ` · ${count("failed")} couldn't be saved`}
            {invalid.length > 0 && ` · ${invalid.length} skipped because of problems`}
          </p>
          <ul className="mt-4 divide-y divide-lavender-200 text-[15px]">
            {outcomes.map((o) => (
              <li key={`${o.line}-${o.name}`} className="flex flex-wrap items-center justify-between gap-2 py-2">
                <span>
                  <span className="text-muted">Row {o.line} · </span>
                  <span className="font-medium text-ink">{o.name}</span>
                </span>
                <StatusPill tone={o.status === "created" || o.status === "added" ? "fresh" : o.status === "failed" ? "expired" : "neutral"}>{o.message}</StatusPill>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex gap-3">
          <ButtonLink href="/pantry">See your pantry</ButtonLink>
          <Button variant="secondary" onClick={() => { setRows(null); setOutcomes(null); setFileName(null); }}>
            Import another file
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {/* Step 1: template + file */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-card border border-lavender-200 bg-white p-6">
          <h2 className="font-display flex items-center gap-2 text-2xl text-eggplant">
            <FileSpreadsheet size={20} className="text-plum" aria-hidden="true" /> 1. Fill in the template
          </h2>
          <p className="mt-2 text-[15px] text-muted">
            One row per item. Name, category and quantity are needed; unit, price and dates are optional. Dates like 2026-11-04 or 11/4/2026.
          </p>
          <a href="/pantry-import-template.csv" download="pantry-import-template.csv" className="mt-4 inline-flex items-center gap-2 text-[15px] font-semibold text-plum hover:text-eggplant">
            <Download size={16} aria-hidden="true" /> Download the template (.csv, opens in Excel)
          </a>
        </div>
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-card border border-dashed border-lavender-300 bg-white p-6 text-center transition hover:bg-lavender">
          <Upload size={24} className="text-plum" aria-hidden="true" />
          <span className="font-display mt-2 text-2xl text-eggplant">2. Choose your file</span>
          <span className="mt-1 text-[15px] text-muted">{fileName ?? ".csv or .xlsx · nothing is saved until you confirm"}</span>
          <input type="file" accept=".csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
        </label>
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-expired-soft px-4 py-3 text-[15px] font-medium text-expired-ink">
          <CircleAlert size={18} className="mt-0.5 shrink-0" aria-hidden="true" /> {error}
        </p>
      )}

      {/* Step 2: preview */}
      {rows && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[15px] text-ink">
              <span className="font-semibold text-fresh-ink">{valid.length} ready to import</span>
              {invalid.length > 0 && (
                <>
                  {" · "}
                  <span className="font-semibold text-expired-ink">{invalid.length} need fixing</span> and will be skipped
                </>
              )}
            </p>
            <Button onClick={doImport} disabled={pending || valid.length === 0} icon={<PackagePlus size={18} aria-hidden="true" />}>
              {pending ? "Importing…" : `Import ${valid.length} ${valid.length === 1 ? "item" : "items"}`}
            </Button>
          </div>

          <div className="overflow-x-auto rounded-card border border-lavender-200 bg-white">
            <table className="w-full text-left text-[15px]">
              <thead className="border-b border-lavender-200 bg-lavender text-sm text-muted">
                <tr>
                  {["Row", "Name", "Category", "Quantity", "Price", "Bought", "Use by", "Status"].map((h) => (
                    <th key={h} scope="col" className="px-4 py-2.5 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-lavender-200">
                {rows.map((r) => (
                  <tr key={r.line} className={r.row ? "" : "bg-expired-soft/40"}>
                    <td className="px-4 py-2.5 text-muted">{r.line}</td>
                    <td className="px-4 py-2.5 font-medium text-ink">{r.raw.name || "—"}</td>
                    <td className="px-4 py-2.5">{r.raw.category || "—"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{[r.raw.quantity, r.raw.unit].filter(Boolean).join(" ") || "—"}</td>
                    <td className="px-4 py-2.5">{r.row ? (r.row.price === null ? "—" : `$${r.row.price.toFixed(2)}`) : r.raw.price || "—"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{r.row?.purchased_on ?? (r.raw.purchased_on || "—")}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{r.row?.expires_on ?? (r.raw.expires_on || "—")}</td>
                    <td className="px-4 py-2.5">
                      {r.row ? (
                        existing.has(r.row.name.toLowerCase()) ? (
                          <StatusPill tone="fresh">Ready · adds to existing</StatusPill>
                        ) : (
                          <StatusPill tone="fresh">Ready</StatusPill>
                        )
                      ) : (
                        <ul className="space-y-0.5 text-sm font-medium text-expired-ink">
                          {r.problems.map((p) => (
                            <li key={p} className="flex items-start gap-1.5">
                              <CircleAlert size={14} className="mt-1 shrink-0" aria-hidden="true" /> {p}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invalid.length > 0 && (
            <p className="text-sm text-muted">Fix the flagged rows in your spreadsheet and import the file again any time. Items that already exist are topped up, not duplicated.</p>
          )}
        </div>
      )}

      {!rows && !error && (
        <p className="text-sm text-muted">
          Prefer to add things one at a time? <Link href="/pantry/new" className="font-semibold text-plum">Add a single item</Link>.
        </p>
      )}
    </section>
  );
}
