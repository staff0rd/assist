import { docsFeedbackMarkers } from "../../shared/docsFeedbackMarkers";
import { changeLoop } from "./changeLoop";
import { changeStepper } from "./changeStepper";
import { doneStore } from "./doneStore";
import { findChanges } from "./findChanges";
import type { ChangedPage } from "./markChangedPages";
import { markDonePages } from "./markDonePages";
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
	storage: Storage | undefined = doc.defaultView?.localStorage,
): void {
	const json = metaContent(doc, docsFeedbackMarkers.changesMeta);
	const pageId = metaContent(doc, docsFeedbackMarkers.pageMeta);
	if (!json) return;
	const pages = JSON.parse(json) as ChangedPage[];
	const store = doneStore(storage);
	const markSidebar = () => markDonePages(doc, pages, store);
	markSidebar();
	const content = doc.querySelector(".sl-markdown-content");
	const index = pages.findIndex((page) => page.id === pageId);
	if (index === -1 || !content) return;
	const bar = doc.createElement("aside");
	bar.className = "assist-diff-nav";
	bar.append(
		...changeStepper(doc, findChanges(content), {
			loop: changeLoop(pages, index, store),
			store,
			go,
			onRefresh: markSidebar,
		}),
	);
	const others = pages.filter((page) => page.id !== pageId);
	if (others.length) bar.append(otherPagesList(doc, others));
	doc.body.append(bar);
}
