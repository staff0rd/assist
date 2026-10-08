import type { NextResponse } from "../../../../../../next/types";

export function isAllClear({
	peerPrs,
	myPrs,
	assignedIssues,
	pickups,
}: NextResponse): boolean {
	return [peerPrs, myPrs, assignedIssues, pickups].every(
		(section) => section.items.length === 0 && !section.error,
	);
}
