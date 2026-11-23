const POLLED_PATHS = new Set([
	"/api/git-status",
	"/api/updates",
	"/api/updates/history",
	"/api/autopilot/status",
	"/api/autopilot/configured",
	"/api/autopilot/repos",
	"/api/releases/configured",
]);

export function isQuietPoll(pathname: string, status: number): boolean {
	return POLLED_PATHS.has(pathname) && status >= 200 && status < 300;
}
