import { useState } from 'react';

/**
 * Reusable hook for the "long-press to select" pattern.
 *
 * Usage:
 *   const sel = useSelectionMode();
 *   <Item onLongPress={() => sel.enter(item.id)} onPress={() => sel.toggle(item.id)} selected={sel.selectedIds.includes(item.id)} />
 *   <Button onPress={sel.cancel} />
 */
export function useSelectionMode() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  /** Enter selection mode and select the first item */
  const enter = (id: string) => {
    setSelectionMode(true);
    setSelectedIds([id]);
  };

  /** Toggle one item's selected state (only works when in selection mode) */
  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  /** Exit selection mode and clear all selections */
  const cancel = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };

  return { selectionMode, selectedIds, enter, toggle, cancel };
}
