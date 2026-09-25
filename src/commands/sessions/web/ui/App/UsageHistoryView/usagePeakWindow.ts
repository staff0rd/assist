import { harnessLabel } from "../../../../../../shared/harnessLabel";
import {
	FIVE_HOUR_SECONDS,
	SEVEN_DAY_SECONDS,
} from "../../../../../../shared/rateLimitLevel";
import {
	parseUsageWindowKey,
	type RateLimitWindow,
	type UsageWindowKey,
} from "../../../../../../shared/usageWindowKey";

type UsagePeakWindowInfo = {
	label: string;
	seconds: number;
	tint?: { light: string; dark: string };
};

const baseWindow: Record<RateLimitWindow, UsagePeakWindowInfo> = {
	five_hour: {
		label: "5h",
		seconds: FIVE_HOUR_SECONDS,
	},
	seven_day: {
		label: "7d",
		seconds: SEVEN_DAY_SECONDS,
		tint: { light: "rgba(0, 0, 0, 0.1)", dark: "rgba(255, 255, 255, 0.1)" },
	},
};

export function usagePeakWindow(key: UsageWindowKey): UsagePeakWindowInfo {
	const parsed = parseUsageWindowKey(key);
	if (!parsed) return baseWindow.five_hour;
	const base = baseWindow[parsed.window];
	if (parsed.harness === "claude") return base;
	return { ...base, label: `${harnessLabel(parsed.harness)} ${base.label}` };
}
