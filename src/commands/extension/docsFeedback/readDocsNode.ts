import { docsFeedbackMarkers } from "../../../shared/docsFeedbackMarkers";

export function readDocsNode(doc: Document): { node?: string } {
	const node = doc.querySelector<HTMLMetaElement>(
		`meta[name="${docsFeedbackMarkers.nodeMeta}"]`,
	)?.content;
	return node ? { node } : {};
}
