import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { judgedGroups } from "../emma/criteria";
import { CLASS_INFO, type CriterionKey, type EmmaClass } from "../emma/matrix";
import type { SiteContent } from "../types";

/** Built-in PDF fonts are WinAnsi only: map characters they cannot draw. */
const safe = (s: string) =>
  s
    .replace(/[−–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/²/g, "2")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "");

const st = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", fontSize: 9, color: "#000" },
  h1: { fontFamily: "Helvetica-Bold", fontSize: 20, marginBottom: 4 },
  meta: { fontSize: 9, color: "#333", marginBottom: 2 },
  summary: { fontFamily: "Helvetica-Bold", fontSize: 11, marginTop: 8, marginBottom: 12 },
  group: { backgroundColor: "#000231", color: "#E5A90A", fontFamily: "Helvetica-Bold", fontSize: 10, padding: 6, marginTop: 10, marginBottom: 6 },
  item: { marginBottom: 7 },
  itemTitle: { fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  line: { marginLeft: 18, color: "#222", marginTop: 1 },
  h2: { fontFamily: "Helvetica-Bold", fontSize: 11, marginTop: 14, marginBottom: 6 },
  footer: { position: "absolute", bottom: 20, left: 40, right: 40, fontSize: 8, color: "#666", textAlign: "center" },
});

function EvidencePack({ c, cls }: { c: SiteContent; cls: EmmaClass }) {
  const ready = Object.fromEntries(c.evidence.map((e) => [e.criterion_key, e.ready])) as Partial<Record<CriterionKey, boolean>>;
  const notes = Object.fromEntries(c.evidence.map((e) => [e.criterion_key, e.note]));
  const r = judgedGroups(cls, ready);
  const v = c.vehicle;
  const photos = c.photos.filter((p) => p.proves_criterion);
  return (
    <Document title={`Black Amethyst evidence pack (${CLASS_INFO[cls].label})`} author="Black Amethyst">
      <Page size="A4" style={st.page}>
        <Text style={st.h1}>BLACK AMETHYST - EVIDENCE PACK</Text>
        <Text style={st.meta}>{safe(`${v.model} · ${v.event} · Class ${CLASS_INFO[cls].label} (${CLASS_INFO[cls].name}) · Category ${v.category}`)}</Text>
        <Text style={st.meta}>{safe([v.owner?.trim() && `Owner ${v.owner}`, `Installer ${v.installer}`].filter(Boolean).join(" · "))}</Text>
        <Text style={st.summary}>{safe(`Evidence ready: ${r.readyPts} / ${r.total} points (${r.pct}%) · ${r.count} judged criteria`)}</Text>
        {r.groups.map((g) => (
          <View key={g.title}>
            <Text style={st.group} minPresenceAhead={40}>
              {safe(`${g.title.toUpperCase()}  ·  ${g.sum} PTS MAX`)}
            </Text>
            {g.items.map((it) => (
              <View key={it.key} style={st.item} wrap={false}>
                <Text style={st.itemTitle}>{safe(`[${it.ready ? "x" : " "}]  ${it.name}  -  max ${it.maxPts} pts`)}</Text>
                <Text style={st.line}>{safe(`Judges check: ${it.check}`)}</Text>
                <Text style={st.line}>{safe(`Evidence: ${it.evidence} (site: ${it.linkLabel})`)}</Text>
                {notes[it.key] ? <Text style={st.line}>{safe(`Note: ${notes[it.key]}`)}</Text> : null}
              </View>
            ))}
          </View>
        ))}
        {photos.length > 0 && (
          <View>
            <Text style={st.h2} minPresenceAhead={30}>
              PHOTO LOG INDEX
            </Text>
            {photos.map((p) => (
              <Text key={p.id} style={{ marginBottom: 2 }}>
                {safe(`${p.code}  ${p.caption}  ->  proves: ${p.proves_criterion}`)}
              </Text>
            ))}
          </View>
        )}
        <Text style={st.footer} render={({ pageNumber, totalPages }) => `Black Amethyst · EMMA 2026 · page ${pageNumber} / ${totalPages}`} fixed />
      </Page>
    </Document>
  );
}

/** Build the PDF in the browser and start the download. */
export async function downloadEvidencePack(c: SiteContent, cls: EmmaClass) {
  const blob = await pdf(<EvidencePack c={c} cls={cls} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `black-amethyst-evidence-pack-${cls}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
