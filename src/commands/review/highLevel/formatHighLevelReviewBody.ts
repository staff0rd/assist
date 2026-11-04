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

function findings(items: HighLevelReviewItem[]): string | undefined {
	const lines = items.map(formatItem).filter((line) => line !== undefined);
	return lines.length > 0 ? lines.join("\n") : undefined;
}

function sliceSections(items: HighLevelReviewItem[]): string[] {
	const bySlice = new Map<number, HighLevelReviewItem[]>();
	for (const item of items)
		if (item.slice !== undefined)
			bySlice.set(item.slice, [...(bySlice.get(item.slice) ?? []), item]);
	return [...bySlice].flatMap(([number, sliceItems]) => {
		const lines = findings(sliceItems);
		if (!lines) return [];
		const title = sliceItems[0]?.sliceTitle;
		return [`**Slice ${number}${title ? `: ${title}` : ""}**\n\n${lines}`];
	});
}

export function formatHighLevelReviewBody(
	items: HighLevelReviewItem[],
	reviewComments: PreviewReviewComment[] = [],
): string {
	const sections: string[] = [];
	const prWide = findings(items.filter((item) => item.slice === undefined));
	if (prWide) sections.push(prWide);
	sections.push(...sliceSections(items));
	if (reviewComments.length > 0)
		sections.push(
			`**Comments**\n\n${reviewComments.map(formatReviewComment).join("\n")}`,
		);
	return sections.join("\n\n");
}
