import { harnessUsageAccounts } from "./harnessAdapters/harnessUsageAccounts";
import type { HarnessKind } from "./harnesses";
import { resolveHarness } from "./harnessLabel";

export type RateLimitWindow = "five_hour" | "seven_day";

export type UsageWindowKey =
	| RateLimitWindow
	| `${Exclude<HarnessKind, "claude">}:${RateLimitWindow}`;

export const RATE_LIMIT_WINDOWS = ["five_hour", "seven_day"] as const;

const accounts = Object.entries(harnessUsageAccounts) as [
	HarnessKind,
	{ windowPrefix?: string },
][];

export function usageWindowKey(
	harness: HarnessKind | undefined,
	window: RateLimitWindow,
): UsageWindowKey {
	const prefix = harnessUsageAccounts[resolveHarness(harness)].windowPrefix;
	return (prefix ? `${prefix}:${window}` : window) as UsageWindowKey;
}

export function parseUsageWindowKey(
	key: string,
): { harness: HarnessKind; window: RateLimitWindow } | undefined {
	const [prefix, suffix] = key.includes(":")
		? key.split(":", 2)
		: [undefined, key];
	const account = accounts.find(([, a]) => a.windowPrefix === prefix);
	const window = RATE_LIMIT_WINDOWS.find((w) => w === suffix);
	if (!account || !window) return undefined;
	return { harness: account[0], window };
}
