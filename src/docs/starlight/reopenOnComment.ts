import { docsFeedbackMarkers } from "../../shared/docsFeedbackMarkers";

export function reopenOnComment(
	doc: Document,
	changes: Element[][],
	reopen: (index: number) => void,
) {
	doc.addEventListener(docsFeedbackMarkers.commentedEvent, (event) => {
		const target = event.target as Node;
		const index = changes.findIndex((change) =>
			change.some((element) => element.contains(target)),
		);
		if (index !== -1) reopen(index);
	});
}
