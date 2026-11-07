const ASSIST_ORIGIN = "github.com/staff0rd/assist";

export function findAssistClone(
	repos: string[],
	originOf: (cwd: string) => string | undefined,
): string | undefined {
	return repos.find((cwd) => originOf(cwd)?.toLowerCase() === ASSIST_ORIGIN);
}
