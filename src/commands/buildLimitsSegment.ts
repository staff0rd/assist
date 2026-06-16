import chalk from "chalk";
import type { RateLimits } from "../shared/RateLimits";
import {
	FIVE_HOUR_SECONDS,
	formatRateLimitTimeLeft,
	type RateLimitLevel,
	rateLimitLevel,
	SEVEN_DAY_SECONDS,
} from "../shared/rateLimitLevel";

const LEVEL_COLOR: Record<RateLimitLevel, (s: string) => string> = {
	ok: chalk.green,
	warn: chalk.yellow,
	over: chalk.red,
};

function formatLimit(
	pct: number,
	resetsAt: number | undefined,
	windowSeconds: number,
	fallbackLabel: string,
	now: number,
): string {
	const level = rateLimitLevel(pct, resetsAt, windowSeconds, now);
	const label = LEVEL_COLOR[level](`${Math.round(pct)}%`);
	const timeLabel = resetsAt
		? formatRateLimitTimeLeft(resetsAt, now)
		: fallbackLabel;
	return `${label} (${timeLabel})`;
}

export function buildLimitsSegment(rateLimits?: RateLimits): string {
	const fiveHrPct = rateLimits?.five_hour?.used_percentage;
	const sevenDayPct = rateLimits?.seven_day?.used_percentage;
	if (fiveHrPct == null || sevenDayPct == null) return "";
	const now = Math.floor(Date.now() / 1000);
	const fiveHr = formatLimit(
		fiveHrPct,
		rateLimits?.five_hour?.resets_at,
		FIVE_HOUR_SECONDS,
		"5h",
		now,
	);
	const sevenDay = formatLimit(
		sevenDayPct,
		rateLimits?.seven_day?.resets_at,
		SEVEN_DAY_SECONDS,
		"7d",
		now,
	);
	return ` | Limits - ${fiveHr}, ${sevenDay}`;
}
