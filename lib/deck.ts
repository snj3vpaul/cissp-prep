import type { CardState, Flashcard } from "@/lib/types";

/** RFC-4180-ish CSV escaping. */
const esc = (v: string) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/**
 * Anki-compatible CSV: Front, Back, Tags. Anki's importer maps columns to fields;
 * tags are space-separated (e.g. "cissp domain3").
 */
export function toAnkiCsv(cards: Flashcard[]) {
  const lines = ["#separator:Comma", "#html:false", "#tags column:3"];
  for (const c of cards) {
    const back = c.mnemonic ? `${c.back}\n\nMnemonic: ${c.mnemonic}` : c.back;
    lines.push([esc(c.front), esc(back), esc(`cissp domain${c.domain}`)].join(","));
  }
  return lines.join("\n");
}

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') q = false;
      else field += ch;
    } else if (ch === '"') q = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()) && !r[0]?.startsWith("#"));
}

/** Accepts our JSON export, a plain array of cards, or a CSV (front,back[,tags|domain]). */
export function importDeck(text: string, filename: string): Flashcard[] {
  const now = new Date().toISOString().slice(0, 10);
  const mk = (front: string, back: string, domain: number, i: number, mnemonic?: string): Flashcard => ({
    id: `import-${Date.now().toString(36)}-${i}`,
    domain: domain >= 1 && domain <= 8 ? domain : 1,
    front: front.trim(),
    back: back.trim(),
    mnemonic: mnemonic?.trim() || undefined,
    interval: 0,
    easeFactor: 2.5,
    dueDate: now,
  });

  if (filename.toLowerCase().endsWith(".json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
    const data = JSON.parse(text);
    const list: Partial<Flashcard>[] = Array.isArray(data) ? data : data.cards ?? data.customCards ?? [];
    return list
      .filter((c) => c.front && c.back)
      .map((c, i) => ({ ...mk(c.front!, c.back!, Number(c.domain) || 1, i, c.mnemonic), id: c.id && !c.id.startsWith("d") ? c.id : `import-${Date.now().toString(36)}-${i}` }));
  }

  const rows = parseCsv(text);
  const start = rows[0] && /^front$/i.test(rows[0][0]?.trim() ?? "") ? 1 : 0;
  return rows.slice(start).map((r, i) => {
    const tag = r[2] ?? "";
    const dm = tag.match(/domain\s*(\d)/i) ?? tag.match(/^(\d)$/);
    return mk(r[0] ?? "", r[1] ?? "", dm ? Number(dm[1]) : 1, i);
  }).filter((c) => c.front && c.back);
}

export function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportDeckJson(cards: Flashcard[], states: Record<string, CardState>) {
  return JSON.stringify(
    {
      format: "cissp-command-center-deck",
      version: 1,
      exportedAt: new Date().toISOString(),
      cards: cards.map((c) => {
        const s = states[c.id];
        return s ? { ...c, interval: s.interval, easeFactor: s.easeFactor, dueDate: s.dueDate } : c;
      }),
    },
    null,
    2
  );
}
