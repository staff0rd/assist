import type { NextPr } from "../../../../../../../next/types";
import { formatRelativeTime } from "../../../../../../formatRelativeTime";

export function nextPrWhy(pr: NextPr, waiting: number): string {
	const oldest = waiting > 1 ? `the oldest of ${waiting} PRs` : "the only PR";
	const who =
		pr.reason === "requested"
			? `${pr.author} requested your review ${formatRelativeTime(pr.requestedAt)}`
			: `${pr.author} is a peer and opened it ${formatRelativeTime(pr.createdAt)}`;
	const blocking =
		pr.checks === "success"
			? " Checks pass, so your review is what it is waiting on."
			: "";
	return `${who} — ${oldest} waiting on your review.${blocking}`;
}
