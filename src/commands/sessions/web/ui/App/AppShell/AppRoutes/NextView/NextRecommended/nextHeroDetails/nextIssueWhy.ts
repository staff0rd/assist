import type { NextIssue } from "../../../../../../../next/types";
import { formatRelativeTime } from "../../../../../../formatRelativeTime";

export function nextIssueWhy(
	issue: NextIssue,
	assigned: number,
	prsClear: boolean,
): string {
	const oldest =
		assigned > 1
			? `the oldest of ${assigned} issues assigned to you`
			: "the only issue assigned to you";
	const clear = prsClear ? ", and no peer PRs await your review" : "";
	return `Opened ${formatRelativeTime(issue.createdAt)} — ${oldest}${clear}.`;
}
