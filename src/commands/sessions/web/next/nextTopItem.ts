import type { NextIssue, NextPickup, NextPr, NextResponse } from "./types";

type NextTop =
	| { kind: "pr"; item: NextPr }
	| { kind: "issue"; item: NextIssue }
	| { kind: "pickup"; item: NextPickup }
	| { kind: "mine"; item: NextPr };

export function nextTopItem(
	data: Pick<NextResponse, "peerPrs" | "myPrs" | "assignedIssues" | "pickups">,
): NextTop | null {
	const pr = data.peerPrs.items[0];
	if (pr) return { kind: "pr", item: pr };
	const issue = data.assignedIssues.items[0];
	if (issue) return { kind: "issue", item: issue };
	const pickup = data.pickups.items[0];
	if (pickup) return { kind: "pickup", item: pickup };
	const mine = data.myPrs.items[0];
	return mine ? { kind: "mine", item: mine } : null;
}
