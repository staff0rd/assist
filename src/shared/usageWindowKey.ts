import type { HarnessKind } from "./harnesses";
import { resolveHarness } from "./harnessLabel";

export type RateLimitWindow = "five_hour" | "seven_day";

export type UsageWindowKey =
	| RateLimitWindow
	| `${Exclude<HarnessKind, "claude">}:${RateLimitWindow}`;

export const RATE_LIMIT_WINDOWS = ["five_hour", "seven_day"] as const;

const HARNESS_KINDS: readonly HarnessKind[] = ["claude", "codex", "pi"];

export function usageWindowKey(
	harness: HarnessKind | undefined,
	window: RateLimitWindow,
): UsageWindowKey {
	const kind = resolveHarness(harness);
	return kind === "claude" ? window : `${kind}:${window}`;
}

export function parseUsageWindowKey(
	key: string,
): { harness: HarnessKind; window: RateLimitWindow } | undefined {
	const [prefix, suffix] = key.includes(":")
		? key.split(":", 2)
		: ["claude", key];
	const harness = HARNESS_KINDS.find((h) => h === prefix);
	const window = RATE_LIMIT_WINDOWS.find((w) => w === suffix);
	if (!harness || !window) return undefined;
	if (harness === "claude" && key.includes(":")) return undefined;
	return { harness, window };
}
