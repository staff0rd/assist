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

export function showDocsChanges(
	doc: Document,
	go: (href: string) => void = (href) => doc.location.assign(href),
): void {
	const json = metaContent(doc, docsFeedbackMarkers.changesMeta);
	const pageId = metaContent(doc, docsFeedbackMarkers.pageMeta);
	const content = doc.querySelector(".sl-markdown-content");
	if (!json || !content) return;
	const pages = JSON.parse(json) as ChangedPage[];
	const index = pages.findIndex((page) => page.id === pageId);
	if (index === -1) return;
	const neighbour = (offset: number) =>
		pages.length > 1
			? pages[(index + offset + pages.length) % pages.length].href
			: undefined;
	const bar = doc.createElement("aside");
	bar.className = "assist-diff-nav";
	bar.append(
		...changeStepper(doc, findChanges(content), {
			previous: neighbour(-1),
			next: neighbour(1),
			go,
		}),
	);
	const others = pages.filter((page) => page.id !== pageId);
	if (others.length) bar.append(otherPagesList(doc, others));
	doc.body.append(bar);
}
