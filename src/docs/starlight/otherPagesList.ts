import type { ChangedPage } from "./markChangedPages";

export function otherPagesList(doc: Document, pages: ChangedPage[]) {
	const details = doc.createElement("details");
	const summary = doc.createElement("summary");
	summary.textContent = `${pages.length} other changed page${pages.length === 1 ? "" : "s"}`;
	const list = doc.createElement("ul");
	for (const page of pages) {
		const link = doc.createElement("a");
		link.href = page.href;
		link.textContent = page.label;
		const item = doc.createElement("li");
		item.append(link);
		list.append(item);
	}
	details.append(summary, list);
	return details;
}
