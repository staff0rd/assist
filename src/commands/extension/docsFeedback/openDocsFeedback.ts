import { toggleAssistPopover } from "../sendToAssist/toggleAssistPopover";
import { docsFeedbackDraft } from "./docsFeedbackDraft";
import { docsFeedbackPopover } from "./docsFeedbackPopover";
import { docsFeedbackSender } from "./docsFeedbackSender";
import { highlightRange } from "./highlightRange";
import type { DocsSelection } from "./readDocsSelection";

function endOfRange(range: Range): { top: number; left: number } {
	const rects = range.getClientRects();
	const last = rects[rects.length - 1] ?? range.getBoundingClientRect();
	return {
		top: last.bottom + window.scrollY,
		left: last.right + window.scrollX,
	};
}

function selectionEndAnchor(range: Range): HTMLElement {
	const anchor = document.createElement("div");
	anchor.setAttribute("data-assist-docs-feedback", "");
	anchor.setAttribute("aria-hidden", "true");
	const { top, left } = endOfRange(range);
	anchor.style.cssText = `position: absolute;top: ${top}px;left: ${left}px;width: 0;height: 0;pointer-events: none`;
	return anchor;
}

type Restore = { prompt?: string; highlight?: boolean };

function saveDraft({ range: _range, ...selection }: DocsSelection) {
	return (prompt: string) => {
		if (prompt.trim()) docsFeedbackDraft.save({ ...selection, prompt });
		else docsFeedbackDraft.clear();
	};
}

export function openDocsFeedback(
	selection: DocsSelection,
	{ prompt, highlight = true }: Restore = {},
): () => void {
	const anchor = selectionEndAnchor(selection.range);
	document.body.append(anchor);
	const unhighlight = highlight ? highlightRange(selection.range) : () => {};
	const release = () => {
		anchor.remove();
		unhighlight();
		docsFeedbackDraft.clear();
	};
	const send = docsFeedbackSender(selection, release);
	toggleAssistPopover(anchor, (dismiss) =>
		docsFeedbackPopover(
			send,
			(restoreFocus) => {
				dismiss(restoreFocus);
				release();
			},
			{
				selectedText: selection.selection,
				prompt,
				onPromptChange: saveDraft(selection),
			},
		),
	);
	return release;
}
