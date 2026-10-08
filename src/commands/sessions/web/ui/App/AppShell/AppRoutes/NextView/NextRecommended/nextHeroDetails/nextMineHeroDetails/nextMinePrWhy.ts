import type { NextPr } from "../../../../../../../../next/types";
import { formatRelativeTime } from "../../../../../../../formatRelativeTime";

export function nextMinePrWhy(
	pr: NextPr,
	open: number,
	othersClear: boolean,
): string {
	const oldest =
		open > 1 ? `the oldest of your ${open} open PRs` : "your only open PR";
	const draft = pr.isDraft ? "drafted" : "opened";
	const clear = othersClear
		? ", and nothing else awaits your review, is assigned to you or is ready to pick up"
		: "";
	return `You ${draft} it ${formatRelativeTime(pr.createdAt)} — ${oldest}${clear}.`;
}
