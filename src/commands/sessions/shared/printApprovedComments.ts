import { formatPreviewComments } from "./formatPreviewComments";
import type { PreviewDecision } from "./PreviewDecision";

export function printApprovedComments(decision: PreviewDecision): void {
	console.log("Approved.");
	const comments = decision.comments ?? [];
	if (comments.length === 0) return;
	console.log(
		`\nThe reviewer left ${comments.length} comment${comments.length === 1 ? "" : "s"} on the preview. Act on each one:\n`,
	);
	for (const line of formatPreviewComments(comments)) console.log(line);
}
