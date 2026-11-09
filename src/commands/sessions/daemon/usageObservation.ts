import { harnessCapability } from "../../../shared/harnessAdapters/harnessCapability";
import { isPrimaryUsageAccount } from "../../../shared/harnessAdapters/isPrimaryUsageAccount";
import type { HarnessKind } from "../../../shared/harnesses";
import { resolveHarness } from "../../../shared/harnessLabel";
import type { RateLimits } from "../../../shared/RateLimits";

type UsageObservation = {
	account: HarnessKind;
	harness?: HarnessKind;
	message: { type: "limits"; harness?: HarnessKind; rateLimits: RateLimits };
};

export function usageObservation(
	harness: HarnessKind | undefined,
	rateLimits: RateLimits,
): UsageObservation | undefined {
	const account = resolveHarness(harness);
	if (!harnessCapability(account, "usage.rateLimits").supported)
		return undefined;
	if (isPrimaryUsageAccount(account))
		return { account, message: { type: "limits", rateLimits } };
	return {
		account,
		harness: account,
		message: { type: "limits", harness: account, rateLimits },
	};
}
