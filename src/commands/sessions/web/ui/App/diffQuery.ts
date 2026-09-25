export function diffQuery(
	cwd: string,
	sessionId?: string,
	scope?: string,
): string {
	const params = new URLSearchParams({ cwd });
	if (sessionId) params.set("session", sessionId);
	if (scope && scope !== "all") params.set("scope", scope);
	return params.toString();
}
