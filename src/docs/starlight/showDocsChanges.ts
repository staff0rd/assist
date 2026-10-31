import { docsFeedbackMarkers } from "../../shared/docsFeedbackMarkers";
import { changeStepper } from "./changeStepper";
import { findChanges } from "./findChanges";
import type { ChangedPage } from "./markChangedPages";
import { otherPagesList } from "./otherPagesList";

function metaContent(doc: Document, name: string): string | undefined {
	return (
		doc.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content ??
		undefined
	);
}

export function showDocsChanges(doc: Document): void {
	const json = metaContent(doc, docsFeedbackMarkers.changesMeta);
	const pageId = metaContent(doc, docsFeedbackMarkers.pageMeta);
	const content = doc.querySelector(".sl-markdown-content");
	if (!json || !content) return;
	const pages = JSON.parse(json) as ChangedPage[];
	if (!pages.some((page) => page.id === pageId)) return;
	const bar = doc.createElement("aside");
	bar.className = "assist-diff-nav";
	bar.append(...changeStepper(doc, findChanges(content)));
	const others = pages.filter((page) => page.id !== pageId);
	if (others.length) bar.append(otherPagesList(doc, others));
	doc.body.append(bar);
}
