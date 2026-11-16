import type { ResponseUsage } from "../../../../shared/db/recordPhaseTranscriptUsage";
import type { HarnessKind } from "../../../../shared/harnesses";
import type { RateLimits } from "../../../../shared/RateLimits";

export type DrivenUsage = {
	responses: ResponseUsage[];
	usedPct?: number;
	rateLimits?: RateLimits;
};

type SdkUsageSink = {
	limits: (rateLimits: RateLimits) => void;
	usage: (
		conversationId: string,
		transcriptPath: string | undefined,
		usedPct: number | undefined,
	) => void;
	session: (
		sessionId: string,
		account: HarnessKind,
		usage: DrivenUsage,
	) => void;
};

let sink: SdkUsageSink | undefined;

export function setSdkUsageSink(next: SdkUsageSink): void {
	sink = next;
}

export function sdkUsageSink(): SdkUsageSink | undefined {
	return sink;
}
