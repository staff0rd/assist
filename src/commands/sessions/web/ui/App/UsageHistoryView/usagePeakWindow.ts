import { isPrimaryUsageAccount } from "../../../../../../shared/harnessAdapters/isPrimaryUsageAccount";
import { harnessLabel } from "../../../../../../shared/harnessAdapters/harnessLabel";
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
	striped?: boolean;
};

const baseWindow: Record<RateLimitWindow, UsagePeakWindowInfo> = {
	five_hour: {
		label: "5h",
		seconds: FIVE_HOUR_SECONDS,
	},
	seven_day: {
		label: "7d",
		seconds: SEVEN_DAY_SECONDS,
		striped: true,
	},
};

export function usagePeakWindow(key: UsageWindowKey): UsagePeakWindowInfo {
	const parsed = parseUsageWindowKey(key);
	if (!parsed) return baseWindow.five_hour;
	const base = baseWindow[parsed.window];
	if (isPrimaryUsageAccount(parsed.harness)) return base;
	return { ...base, label: `${harnessLabel(parsed.harness)} ${base.label}` };
}
