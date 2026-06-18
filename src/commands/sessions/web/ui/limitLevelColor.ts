import type { RateLimitLevel } from "../../../../shared/rateLimitLevel";

const LEVEL_COLOR: Record<RateLimitLevel, string> = {
	ok: "success.main",
	warn: "warning.main",
	over: "error.main",
};

/** MUI sx color token for a rate-limit level, shared by the usage chips and history table. */
export function limitLevelColor(level: RateLimitLevel): string {
	return LEVEL_COLOR[level];
}
