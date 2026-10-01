import { formatPreviewComments } from "./formatPreviewComments";
import type { PreviewDecision } from "./PreviewDecision";

export function reportPreviewRejection(
	subject: string,
	decision: PreviewDecision,
	advice?: string,
): never {
	console.error(
		`${subject} rejected${decision.reason ? `: ${decision.reason}` : "."}`,
	);
	const comments = decision.comments ?? [];
	if (comments.length > 0) {
		console.error(
			`\nThe reviewer left ${comments.length} comment${comments.length === 1 ? "" : "s"} on the preview. Address each one, then re-run this command:\n`,
		);
		for (const line of formatPreviewComments(comments)) console.error(line);
	}
	if (advice) console.error(advice);
	process.exit(1);
}
