/**
 * Layered tree layout for the system and wiring diagrams.
 * Columns = depth from the root; leaves are stacked top to bottom and each
 * parent is centred on its children. Pure function so it can be unit-tested.
 */

export type DiagramEdge = { from: string; to: string };

export type LayoutOptions = {
  cardW: number;
  cardH: number;
  colGap: number;
  rowGap: number;
  padX: number;
  padTop: number;
  padBottom: number;
};

export type PlacedNode = { key: string; depth: number; x: number; y: number; w: number; h: number };
export type PlacedEdge = DiagramEdge & { path: string; midX: number; x1: number; y1: number; x2: number; y2: number };

export const DEFAULT_LAYOUT: LayoutOptions = {
  cardW: 200,
  cardH: 84,
  colGap: 112,
  rowGap: 24,
  padX: 40,
  padTop: 64,
  padBottom: 40,
};

export function layoutTree(keys: string[], edges: DiagramEdge[], opts: Partial<LayoutOptions> = {}) {
  const o = { ...DEFAULT_LAYOUT, ...opts };
  const set = new Set(keys);
  const valid = edges.filter((e) => set.has(e.from) && set.has(e.to));
  const children = new Map<string, string[]>();
  const hasParent = new Set<string>();
  for (const e of valid) {
    if (hasParent.has(e.to)) continue; // keep the first parent only: it is a tree
    hasParent.add(e.to);
    children.set(e.from, [...(children.get(e.from) ?? []), e.to]);
  }
  const roots = keys.filter((k) => !hasParent.has(k));

  const depth = new Map<string, number>();
  const centerY = new Map<string, number>();
  let slot = 0;
  const visiting = new Set<string>();

  const place = (k: string, d: number): number => {
    if (centerY.has(k)) return centerY.get(k)!;
    if (visiting.has(k)) return o.padTop; // cycle guard
    visiting.add(k);
    depth.set(k, d);
    const kids = children.get(k) ?? [];
    let cy: number;
    if (kids.length === 0) {
      cy = o.padTop + slot * (o.cardH + o.rowGap) + o.cardH / 2;
      slot += 1;
    } else {
      const ys = kids.map((c) => place(c, d + 1));
      cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    }
    centerY.set(k, cy);
    return cy;
  };
  roots.forEach((r) => place(r, 0));

  const maxDepth = Math.max(0, ...Array.from(depth.values()));
  const nodes: PlacedNode[] = keys
    .filter((k) => depth.has(k))
    .map((k) => {
      const d = depth.get(k)!;
      return {
        key: k,
        depth: d,
        x: o.padX + d * (o.cardW + o.colGap),
        y: Math.round(centerY.get(k)! - o.cardH / 2),
        w: o.cardW,
        h: o.cardH,
      };
    });

  const byKey = new Map(nodes.map((n) => [n.key, n]));
  const placedEdges: PlacedEdge[] = [];
  for (const [from, kids] of children) {
    const a = byKey.get(from);
    if (!a) continue;
    for (const to of kids) {
      const b = byKey.get(to);
      if (!b) continue;
      const x1 = a.x + a.w;
      const y1 = a.y + a.h / 2;
      const x2 = b.x;
      const y2 = b.y + b.h / 2;
      const midX = Math.round((x1 + x2) / 2);
      const path = y1 === y2 ? `M ${x1} ${y1} H ${x2 - 6}` : `M ${x1} ${y1} H ${midX} V ${y2} H ${x2 - 6}`;
      placedEdges.push({ from, to, path, midX, x1, y1, x2, y2 });
    }
  }

  const width = o.padX * 2 + (maxDepth + 1) * o.cardW + maxDepth * o.colGap;
  const height = Math.max(o.padTop + slot * (o.cardH + o.rowGap) - o.rowGap + o.padBottom, o.padTop + o.cardH + o.padBottom);
  return { nodes, edges: placedEdges, width, height, columns: maxDepth + 1, options: o };
}

/** Popover placement next to a card: right if it fits, else left; clamped vertically. */
export function popoverPosition(
  card: { x: number; y: number; w: number },
  pop: { w: number; h: number },
  area: { width: number; height: number },
  gap = 16,
) {
  const rightX = card.x + card.w + gap;
  const side: "right" | "left" = rightX + pop.w <= area.width ? "right" : "left";
  const left = side === "right" ? rightX : Math.max(0, card.x - gap - pop.w);
  const top = Math.max(8, Math.min(card.y, area.height - pop.h - 8));
  return { side, left, top };
}
