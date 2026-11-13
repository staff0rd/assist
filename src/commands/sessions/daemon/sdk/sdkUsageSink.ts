import type { RateLimits } from "../../../../shared/RateLimits";

type SdkUsageSink = {
	limits: (rateLimits: RateLimits) => void;
	usage: (
		claudeSessionId: string,
		transcriptPath: string | undefined,
		usedPct: number | undefined,
	) => void;
};

let sink: SdkUsageSink | undefined;

export function setSdkUsageSink(next: SdkUsageSink): void {
	sink = next;
}

export function sdkUsageSink(): SdkUsageSink | undefined {
	return sink;
}
