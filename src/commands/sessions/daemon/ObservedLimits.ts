import {
	type ActiveWindow,
	activeWindows,
} from "../../../shared/activeWindows";
import { isPrimaryUsageAccount } from "../../../shared/harnessAdapters/isPrimaryUsageAccount";
import type { HarnessKind } from "../../../shared/harnesses";
import type { RateLimits } from "../../../shared/RateLimits";
import { usageObservation } from "./usageObservation";

export class ObservedLimits {
	private readonly byAccount = new Map<HarnessKind, RateLimits>();

	observe(harness: HarnessKind | undefined, rateLimits: RateLimits) {
		const observation = usageObservation(harness, rateLimits);
		if (observation) this.byAccount.set(observation.account, rateLimits);
		return observation;
	}

	windows(harness: HarnessKind | undefined): ActiveWindow[] {
		const observation = usageObservation(harness, {});
		if (!observation) return [];
		return activeWindows(this.byAccount.get(observation.account), harness);
	}

	greetings(): object[] {
		return [...this.byAccount]
			.sort(
				([a], [b]) =>
					Number(isPrimaryUsageAccount(b)) - Number(isPrimaryUsageAccount(a)),
			)
			.flatMap(([account, rateLimits]) => {
				const observation = usageObservation(account, rateLimits);
				return observation ? [observation.message] : [];
			});
	}
}
