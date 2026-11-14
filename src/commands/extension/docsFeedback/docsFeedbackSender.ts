import { docsFeedbackMarkers } from "../../../shared/docsFeedbackMarkers";
import { showAssistToast } from "../sendToAssist/showAssistToast";
import type { DocsSelection } from "./readDocsSelection";
import { sendDocsFeedback } from "./sendDocsFeedback";

function announceComment(range: Range) {
	const node = range.startContainer;
	const element = node instanceof Element ? node : node.parentElement;
	element?.dispatchEvent(
		new Event(docsFeedbackMarkers.commentedEvent, { bubbles: true }),
	);
}

export function docsFeedbackSender(
	selection: DocsSelection,
	onSent: () => void,
) {
	return async (prompt: string) => {
		const result = await sendDocsFeedback(selection, prompt);
		if (result.ok) {
			announceComment(selection.range);
			onSent();
			showAssistToast(result.message, true);
		}
		return result;
	};
}
