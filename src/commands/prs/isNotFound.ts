export function isNotFound(error: unknown): boolean {
	if (error instanceof Error) {
		return (
			error.message.includes("HTTP 404") ||
			error.message.includes("Could not resolve to a PullRequest")
		);
	}
	return false;
}
