import { docsFeedbackMarkers } from "../../shared/docsFeedbackMarkers";
import type { DoneStore } from "./doneStore";
import type { ChangedPage } from "./markChangedPages";

export function markDonePages(
	doc: Document,
	pages: ChangedPage[],
	store: DoneStore,
) {
	const done = new Set(
		pages.filter((page) => store.leftOn(page) === 0).map((page) => page.href),
	);
	for (const link of doc.querySelectorAll<HTMLAnchorElement>(
		`a[${docsFeedbackMarkers.changedAttribute}]`,
	))
		link.toggleAttribute(
			docsFeedbackMarkers.doneAttribute,
			done.has(link.getAttribute("href") ?? ""),
		);
}
