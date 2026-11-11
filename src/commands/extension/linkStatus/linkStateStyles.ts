import type { LinkState } from "../../sessions/web/linkStatus/LinkState";

type LinkStateStyle = { label: string; color: string; paths: string[] };

export const linkStateStyles: Partial<Record<LinkState, LinkStateStyle>> = {
	"issue-open": {
		label: "Open issue",
		color: "var(--fgColor-open, #1a7f37)",
		paths: [
			"M8 9.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z",
			"M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Z",
		],
	},
	"issue-completed": {
		label: "Closed issue (completed)",
		color: "var(--fgColor-done, #8250df)",
		paths: [
			"M11.28 6.78a.75.75 0 0 0-1.06-1.06L7.25 8.69 5.78 7.22a.75.75 0 0 0-1.06 1.06l2 2a.75.75 0 0 0 1.06 0l3.5-3.5Z",
			"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 0-13 0 6.5 6.5 0 0 0 13 0Z",
		],
	},
	"issue-not-planned": {
		label: "Closed issue (not planned)",
		color: "var(--fgColor-muted, #59636e)",
		paths: [
			"M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm9.78-2.22-5.5 5.5a.749.749 0 0 1-1.275-.326.749.749 0 0 1 .215-.734l5.5-5.5a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z",
		],
	},
};
