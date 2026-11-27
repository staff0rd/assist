export function agentFooter(
	unresolvedCount: number,
	unhandledReviewCount: number,
): string {
	if (unresolvedCount === 0 && unhandledReviewCount === 0)
		return "No unresolved threads or unhandled reviews to process.";
	return "Every unresolved thread and unhandled review is printed in full above, with its author, id, url and body. Work from this output — do not read or parse the YAML cache; fixed, wontfix, reply and review-reply locate it themselves.";
}
