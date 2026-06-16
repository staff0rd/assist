export const FIVE_HOUR_SECONDS = 5 * 3600;
export const SEVEN_DAY_SECONDS = 7 * 86400;

export type RateLimitLevel = "ok" | "warn" | "over";

export function formatRateLimitTimeLeft(resetsAt: number, now: number): string {
	const seconds = Math.max(0, resetsAt - now);
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
}

// why: a 5h window sitting at 50% with 4h still left is on track to blow past
// 100%, so the level reflects the projected end-of-window usage, not the raw %
function projectUsage(
	pct: number,
	resetsAt: number | undefined,
	windowSeconds: number,
	now: number,
): number | undefined {
	if (resetsAt == null) return undefined;
	const timeRemaining = Math.max(0, resetsAt - now);
	const elapsed = Math.max(0, windowSeconds - timeRemaining) / windowSeconds;
	if (elapsed < 0.05) return undefined;
	return pct / elapsed;
}

export function rateLimitLevel(
	pct: number,
	resetsAt: number | undefined,
	windowSeconds: number,
	now: number,
): RateLimitLevel {
	const projected = projectUsage(pct, resetsAt, windowSeconds, now);
	if (projected == null) return "ok";
	if (projected > 100) return "over";
	if (projected > 75) return "warn";
	return "ok";
}
