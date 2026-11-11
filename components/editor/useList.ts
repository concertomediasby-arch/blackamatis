"use client";

import type { SiteContent } from "@/lib/types";
import { useEditor } from "./EditorProvider";

type ListKey = { [K in keyof SiteContent]: SiteContent[K] extends unknown[] ? K : never }[keyof SiteContent];
type Item<K extends ListKey> = SiteContent[K][number];

export const newId = () => crypto.randomUUID();

/** Read and edit one list of the editor draft (e.g. "milestones"). */
export function useList<K extends ListKey>(key: K) {
  const { content, update } = useEditor();
  const items = content[key] as Item<K>[];
  const setItems = (fn: (items: Item<K>[]) => Item<K>[]) => update((c) => ({ ...c, [key]: fn(c[key] as Item<K>[]) }));
  const patch = (id: string, p: Partial<Item<K>>) =>
    setItems((xs) => xs.map((x) => ((x as { id: string }).id === id ? ({ ...x, ...p } as Item<K>) : x)));
  const remove = (id: string) => setItems((xs) => xs.filter((x) => (x as { id: string }).id !== id));
  return { items, setItems, patch, remove };
}

/** Move an item within a list and renumber `sort` (1-based). */
export function moveItem<T extends { sort: number }>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [it] = next.splice(from, 1);
  next.splice(to, 0, it);
  return next.map((x, i) => ({ ...x, sort: i + 1 }));
}
