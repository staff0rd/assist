import { formatToolElapsed } from "./formatToolElapsed";

export function formatShellDuration(ms: number): string {
	return ms < 10_000
		? `${(ms / 1000).toFixed(1)}s`
		: formatToolElapsed(ms / 1000);
}
