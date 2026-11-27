import type { Thread } from "./groupThreads";

type SummaryCounts = {
	unhandledReviews: number;
	handledReviews: number;
	unresolved: Thread[];
	resolved: Thread[];
};

export function summarise(counts: SummaryCounts): string {
	const { unhandledReviews, handledReviews, unresolved, resolved } = counts;
	const threadCounts = `${unresolved.length} unresolved and ${resolved.length} resolved threads.`;
	if (unhandledReviews + handledReviews === 0) return `Found ${threadCounts}`;
	const reviews = `${unhandledReviews} unhandled and ${handledReviews} handled review${handledReviews + unhandledReviews === 1 ? "" : "s"}`;
	return `Found ${reviews}, ${threadCounts}`;
}
