import type { PreviewReviewComment } from "../../sessions/shared/PreviewDecision";
import { formatReviewComment } from "./formatReviewComment";
import type { HighLevelReviewItem } from "./types";

const statusMarkers: Record<HighLevelReviewItem["status"], string> = {
	fail: "❌",
	manual: "💬",
	pass: "✅",
};

function formatItem(item: HighLevelReviewItem): string | undefined {
	if (!item.comment) return undefined;
	const comment = item.comment.replace(/\n/g, "\n  ");
	return `- ${statusMarkers[item.status]} **${item.title}** — ${comment}`;
}

export function formatHighLevelReviewBody(
	items: HighLevelReviewItem[],
	reviewComments: PreviewReviewComment[] = [],
): string {
	const sections: string[] = [];
	const findings = items.map(formatItem).filter((line) => line !== undefined);
	if (findings.length > 0) sections.push(findings.join("\n"));
	if (reviewComments.length > 0)
		sections.push(
			`**Comments**\n\n${reviewComments.map(formatReviewComment).join("\n")}`,
		);
	return sections.join("\n\n");
}
