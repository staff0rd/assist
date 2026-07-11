import type { RateLimits } from "./RateLimits";

export type ActiveWindow = {
	window: "five_hour" | "seven_day";
	resetsAt: number;
};

const WINDOWS = ["five_hour", "seven_day"] as const;

export function activeWindows(
	rateLimits: RateLimits | undefined,
): ActiveWindow[] {
	if (!rateLimits) return [];
	const out: ActiveWindow[] = [];
	for (const window of WINDOWS) {
		const resetsAt = rateLimits[window]?.resets_at;
		if (typeof resetsAt === "number") out.push({ window, resetsAt });
	}
	return out;
}
