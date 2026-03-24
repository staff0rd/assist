import chalk from "chalk";

const FIVE_HOUR_SECONDS = 5 * 3600;
const SEVEN_DAY_SECONDS = 7 * 86400;

type RateLimitWindow = {
	used_percentage?: number;
	resets_at?: number;
};

type RateLimits = {
	five_hour?: RateLimitWindow;
	seven_day?: RateLimitWindow;
};

function formatTimeLeft(resetsAt: number): string {
	const seconds = Math.max(0, resetsAt - Math.floor(Date.now() / 1000));
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	return `${minutes}m`;
}

function projectUsage(
	pct: number,
	resetsAt: number | undefined,
	windowSeconds: number,
): number | undefined {
	if (resetsAt == null) return undefined;
	const now = Math.floor(Date.now() / 1000);
	const timeRemaining = Math.max(0, resetsAt - now);
	const elapsed = Math.max(0, windowSeconds - timeRemaining) / windowSeconds;
	if (elapsed < 0.05) return undefined;
	return pct / elapsed;
}

function colorizeRateLimit(
	pct: number,
	resetsAt: number | undefined,
	windowSeconds: number,
): string {
	const label = `${Math.round(pct)}%`;
	const projected = projectUsage(pct, resetsAt, windowSeconds);
	if (projected == null) return chalk.green(label);
	if (projected > 100) return chalk.red(label);
	if (projected > 75) return chalk.yellow(label);
	return chalk.green(label);
}

function formatLimit(
	pct: number,
	resetsAt: number | undefined,
	windowSeconds: number,
	fallbackLabel: string,
): string {
	const timeLabel = resetsAt ? formatTimeLeft(resetsAt) : fallbackLabel;
	return `${colorizeRateLimit(pct, resetsAt, windowSeconds)} (${timeLabel})`;
}

export function buildLimitsSegment(rateLimits?: RateLimits): string {
	const fiveHrPct = rateLimits?.five_hour?.used_percentage;
	const sevenDayPct = rateLimits?.seven_day?.used_percentage;
	if (fiveHrPct == null || sevenDayPct == null) return "";
	const fiveHr = formatLimit(
		fiveHrPct,
		rateLimits?.five_hour?.resets_at,
		FIVE_HOUR_SECONDS,
		"5h",
	);
	const sevenDay = formatLimit(
		sevenDayPct,
		rateLimits?.seven_day?.resets_at,
		SEVEN_DAY_SECONDS,
		"7d",
	);
	return ` | Limits - ${fiveHr}, ${sevenDay}`;
}
