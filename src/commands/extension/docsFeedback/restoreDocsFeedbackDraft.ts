import { docsFeedbackMarkers } from "../../../shared/docsFeedbackMarkers";
import type { DocsFeedback } from "../../sessions/web/docsFeedback/docsFeedbackSchema";
import { docsFeedbackDraft } from "./docsFeedbackDraft";
import { findTextRange } from "./findTextRange";
import { openDocsFeedback } from "./openDocsFeedback";

function sectionElement(doc: Document, draft: DocsFeedback): Element {
	const { headingAttribute, sourceAttribute } = docsFeedbackMarkers;
	const section = [
		...doc.querySelectorAll(`section[${headingAttribute}]`),
	].find(
		(element) =>
			element.getAttribute(headingAttribute) === draft.heading &&
			element.getAttribute(sourceAttribute) === draft.source,
	);
	return section ?? doc.querySelector("main") ?? doc.body;
}

function fallbackRange(doc: Document, section: Element): Range {
	const range = doc.createRange();
	range.selectNodeContents(
		section.querySelector("h1, h2, h3, h4, h5, h6") ?? section,
	);
	return range;
}

export function restoreDocsFeedbackDraft(
	doc: Document,
): (() => void) | undefined {
	const pageId = doc.querySelector<HTMLMetaElement>(
		`meta[name="${docsFeedbackMarkers.pageMeta}"]`,
	)?.content;
	const draft = pageId ? docsFeedbackDraft.load(pageId) : undefined;
	if (!draft) return undefined;
	const { prompt, ...selection } = draft;
	const section = sectionElement(doc, draft);
	const range = findTextRange(section, draft.selection);
	return openDocsFeedback(
		{ ...selection, range: range ?? fallbackRange(doc, section) },
		{ prompt, highlight: Boolean(range) },
	);
}
