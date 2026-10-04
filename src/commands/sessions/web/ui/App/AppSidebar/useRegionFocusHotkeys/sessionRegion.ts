import { holdSessionCardFocus } from "../holdSessionCardFocus";
import type { Region } from "../../focusRegion";

export type RegionKind = "card" | "terminal" | "diff" | "preview";

export const REGION_ATTRIBUTE: Record<RegionKind, string> = {
	card: "data-session-id",
	terminal: "data-terminal-session-id",
	diff: "data-diff-session-id",
	preview: "data-preview-session-id",
};

const focusPanel = (panel: HTMLElement) => panel.focus({ preventScroll: true });

const FOCUS: Record<RegionKind, (element: HTMLElement, id: string) => void> = {
	card: (card, id) => {
		holdSessionCardFocus(id);
		card.scrollIntoView?.({ block: "nearest" });
	},
	terminal: (pane) => pane.querySelector<HTMLElement>("textarea")?.focus(),
	diff: focusPanel,
	preview: focusPanel,
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
