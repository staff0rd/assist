import type { UsagePeakRow as UsagePeakRowData } from "../../../../shared/db/listUsagePeaks";
import {
	FIVE_HOUR_SECONDS,
	SEVEN_DAY_SECONDS,
} from "../../../../shared/rateLimitLevel";

export const usagePeakWindow: Record<
	UsagePeakRowData["window"],
	{ label: string; seconds: number; tint?: { light: string; dark: string } }
> = {
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
