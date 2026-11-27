const markerPattern = /<!-- assist-review-handled: (\d+) -->/g;

export function parseHandledReviewIds(bodies: string[]): Set<number> {
	const ids = new Set<number>();
	for (const body of bodies) {
		for (const match of body.matchAll(markerPattern)) ids.add(Number(match[1]));
	}
	return ids;
}
