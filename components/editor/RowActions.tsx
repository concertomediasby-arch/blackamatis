import { btn } from "./Field";

/** Up / down / remove buttons for a list row. Omit onMove for lists without an order. */
export function RowActions({ index, count, label, onMove, onRemove }: { index: number; count: number; label: string; onMove?: (to: number) => void; onRemove: () => void }) {
  return (
    <div className="flex gap-1.5">
      {onMove && (
        <>
          <button type="button" className={btn.ghost} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move ${label} up`}>
            ↑
          </button>
          <button type="button" className={btn.ghost} disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`Move ${label} down`}>
            ↓
          </button>
        </>
      )}
      <button type="button" className={btn.ghost} onClick={onRemove} aria-label={`Remove ${label}`}>
        ✕
      </button>
    </div>
  );
}
