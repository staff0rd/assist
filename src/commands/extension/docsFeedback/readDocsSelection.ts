import { docsFeedbackMarkers } from "../../../shared/docsFeedbackMarkers";
import type { DocsFeedback } from "../../sessions/web/docsFeedback/docsFeedbackSchema";
import { pageLevelSection } from "./pageLevelSection";
import { readDocsNode } from "./readDocsNode";

export type DocsSelection = Omit<DocsFeedback, "prompt"> & {
	node?: string;
	range: Range;
};

function metaContent(doc: Document, name: string): string | undefined {
	return (
		doc.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)?.content ||
		undefined
	);
}

function sectionOf(
	doc: Document,
	node: Node | null,
): { heading: string; source: string } | undefined {
	const element = node instanceof Element ? node : node?.parentElement;
	const section = element?.closest(
		`section[${docsFeedbackMarkers.headingAttribute}]`,
	);
	if (!section)
		return pageLevelSection(element, {
			title: metaContent(doc, docsFeedbackMarkers.titleMeta),
			source: metaContent(doc, docsFeedbackMarkers.sourceMeta),
		});
	return {
		heading: section.getAttribute(docsFeedbackMarkers.headingAttribute) ?? "",
		source: section.getAttribute(docsFeedbackMarkers.sourceAttribute) ?? "",
	};
}

export function readDocsSelection(
	doc: Document,
	selection: Selection | null,
): DocsSelection | undefined {
	const pageId = metaContent(doc, docsFeedbackMarkers.pageMeta);
	if (!pageId || !selection || selection.isCollapsed) return undefined;
	const text = selection.toString().trim();
	if (!text || selection.rangeCount === 0) return undefined;
	const range = selection.getRangeAt(0);
	const section = sectionOf(doc, range.startContainer);
	if (!section) return undefined;
	return { pageId, ...section, selection: text, range, ...readDocsNode(doc) };
}
