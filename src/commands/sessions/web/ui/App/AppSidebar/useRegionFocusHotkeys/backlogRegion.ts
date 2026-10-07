import type { Region } from "../../focusRegion";

const BACKLOG_ITEM_PATH = /^\/backlog\/items\/[^/]+/;

function markedRegion(target: "search" | "back"): Region {
	return {
		locate: () =>
			globalThis.document.querySelector<HTMLElement>(
				`[data-backlog-focus="${target}"]`,
			),
		focus: (element) =>
			(element.querySelector<HTMLElement>("input") ?? element).focus(),
	};
}

export function backlogRegion(pathname: string): Region | null {
	if (BACKLOG_ITEM_PATH.test(pathname)) return markedRegion("back");
	if (/^\/backlog\/?$/.test(pathname)) return markedRegion("search");
	return null;
}
