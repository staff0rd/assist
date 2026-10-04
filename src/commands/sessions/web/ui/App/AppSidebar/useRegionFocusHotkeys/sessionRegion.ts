import { holdSessionCardFocus } from "../../holdSessionCardFocus";
import type { Region } from "./focusRegion";

type RegionKind = "card" | "terminal" | "diff";

export const REGION_ATTRIBUTE: Record<RegionKind, string> = {
	card: "data-session-id",
	terminal: "data-terminal-session-id",
	diff: "data-diff-session-id",
};

const FOCUS: Record<RegionKind, (element: HTMLElement, id: string) => void> = {
	card: (card, id) => {
		holdSessionCardFocus(id);
		card.scrollIntoView?.({ block: "nearest" });
	},
	terminal: (pane) => pane.querySelector<HTMLElement>("textarea")?.focus(),
	diff: (panel) => panel.focus({ preventScroll: true }),
};

export function sessionRegion(kind: RegionKind, id: string): Region {
	return {
		locate: () =>
			globalThis.document.querySelector<HTMLElement>(
				`[${REGION_ATTRIBUTE[kind]}="${id}"]`,
			),
		focus: (element) => FOCUS[kind](element, id),
	};
}
