import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { judgedGroups } from "@/lib/emma/criteria";
import { CLASS_INFO, isEmmaClass, type CriterionKey } from "@/lib/emma/matrix";
import { getSiteContent } from "@/lib/supabase/queries";

/** Evidence pack PDF, generated server-side from the content in the database. */
export async function GET(req: Request) {
  const c = await getSiteContent();
  const q = new URL(req.url).searchParams.get("class");
  const cls = isEmmaClass(q) ? q : c.vehicle.class;
  const ready = Object.fromEntries(c.evidence.map((e) => [e.criterion_key, e.ready])) as Partial<Record<CriterionKey, boolean>>;
  const notes = Object.fromEntries(c.evidence.map((e) => [e.criterion_key, e.note]));
  const r = judgedGroups(cls, ready);

  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const A4: [number, number] = [595.28, 841.89];
  const M = 48;
  let page = pdf.addPage(A4);
  let y = A4[1] - M;

  // Standard PDF fonts are WinAnsi only: map characters they cannot encode.
  const safe = (s: string) => s.replace(/[−–—]/g, "-").replace(/[“”]/g, '"').replace(/[’]/g, "'").replace(/[²]/g, "2").replace(/[^\x20-\x7E\xA0-\xFF]/g, "");
  const wrap = (text: string, size: number, maxW: number, f = font) => {
    const words = safe(text).split(/\s+/);
    const lines: string[] = [];
    let line = "";
    for (const w of words) {
      const t = line ? `${line} ${w}` : w;
      if (f.widthOfTextAtSize(t, size) > maxW && line) {
        lines.push(line);
        line = w;
      } else line = t;
    }
    if (line) lines.push(line);
    return lines;
  };
  const need = (h: number) => {
    if (y - h < M) {
      page = pdf.addPage(A4);
      y = A4[1] - M;
    }
  };
  const text = (s: string, size: number, opts: { f?: typeof font; x?: number; color?: ReturnType<typeof rgb>; maxW?: number } = {}) => {
    const lines = wrap(s, size, opts.maxW ?? A4[0] - 2 * M - (opts.x ?? 0), opts.f);
    for (const l of lines) {
      need(size + 4);
      page.drawText(l, { x: M + (opts.x ?? 0), y: y - size, size, font: opts.f ?? font, color: opts.color ?? rgb(0, 0, 0) });
      y -= size + 4;
    }
  };

  const v = c.vehicle;
  text("BLACK AMATIS - EVIDENCE PACK", 22, { f: bold });
  y -= 4;
  text(`${v.model} · ${v.event} · Class ${CLASS_INFO[cls].label} (${CLASS_INFO[cls].name}) · Category ${v.category}`, 10);
  text(`Owner ${v.owner} · Installer ${v.installer}`, 10);
  y -= 8;
  text(`Evidence ready: ${r.readyPts} / ${r.total} points (${r.pct}%) · ${r.count} judged criteria`, 12, { f: bold });
  y -= 12;

  for (const g of r.groups) {
    need(40);
    page.drawRectangle({ x: M, y: y - 22, width: A4[0] - 2 * M, height: 22, color: rgb(0, 0.008, 0.19) });
    page.drawText(safe(`${g.title.toUpperCase()}  ·  ${g.sum} PTS MAX`), { x: M + 8, y: y - 15, size: 10, font: bold, color: rgb(0.9, 0.66, 0.04) });
    y -= 32;
    for (const it of g.items) {
      need(60);
      text(`[${it.ready ? "x" : " "}]  ${it.name}  —  max ${it.maxPts} pts`, 11, { f: bold });
      text(`Judges check: ${it.check}`, 9, { x: 22 });
      text(`Evidence: ${it.evidence} (site: ${it.linkLabel})`, 9, { x: 22 });
      if (notes[it.key]) text(`Note: ${notes[it.key]}`, 9, { x: 22 });
      y -= 6;
    }
    y -= 6;
  }

  const photos = c.photos.filter((p) => p.proves_criterion);
  if (photos.length) {
    need(40);
    y -= 6;
    text("PHOTO LOG INDEX", 12, { f: bold });
    for (const p of photos) text(`${p.code}  ${p.caption}  ->  proves: ${p.proves_criterion}`, 9);
  }

  const bytes = await pdf.save();
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="black-amatis-evidence-pack-${cls}.pdf"`,
    },
  });
}
