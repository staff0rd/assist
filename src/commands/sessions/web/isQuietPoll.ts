const POLLED_PATHS = new Set(["/api/git-status"]);

export function isQuietPoll(pathname: string, status: number): boolean {
	return POLLED_PATHS.has(pathname) && status >= 200 && status < 300;
}
