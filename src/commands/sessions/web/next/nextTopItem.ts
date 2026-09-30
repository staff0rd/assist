import type { NextIssue, NextPickup, NextPr, NextResponse } from "./types";

type NextTop =
	| { kind: "pr"; item: NextPr }
	| { kind: "issue"; item: NextIssue }
	| { kind: "pickup"; item: NextPickup };

export function nextTopItem(
	data: Pick<NextResponse, "peerPrs" | "assignedIssues" | "pickups">,
): NextTop | null {
	const pr = data.peerPrs.items[0];
	if (pr) return { kind: "pr", item: pr };
	const issue = data.assignedIssues.items[0];
	if (issue) return { kind: "issue", item: issue };
	const pickup = data.pickups.items[0];
	return pickup ? { kind: "pickup", item: pickup } : null;
}
