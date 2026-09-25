import { useCallback, useState } from "react";
import type { HarnessKind } from "../../../../../../shared/harnesses";
import type {
	HarnessRateLimits,
	RateLimits,
} from "../../../../../../shared/RateLimits";

export function useRateLimitsState() {
	const [rateLimits, setRateLimits] = useState<RateLimits | null>(null);
	const [harnessRateLimits, setHarnessRateLimits] = useState<HarnessRateLimits>(
		{},
	);
	const storeHarnessRateLimits = useCallback(
		(harness: HarnessKind, limits: RateLimits) => {
			if (harness === "claude") return;
			setHarnessRateLimits((prev) => ({ ...prev, [harness]: limits }));
		},
		[],
	);
	return {
		rateLimits,
		setRateLimits,
		harnessRateLimits,
		setHarnessRateLimits: storeHarnessRateLimits,
	};
}
