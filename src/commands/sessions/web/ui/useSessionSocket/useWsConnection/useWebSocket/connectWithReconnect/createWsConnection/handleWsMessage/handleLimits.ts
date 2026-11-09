import { isPrimaryUsageAccount } from "../../../../../../../../../../shared/harnessAdapters/isPrimaryUsageAccount";
import type { HarnessKind } from "../../../../../../../../../../shared/harnesses";
import type { RateLimits } from "../../../../../../../../../../shared/RateLimits";
import type { WsDispatch } from "../../../WsDispatch";

export function handleLimits(
	msg: Record<string, unknown>,
	d: WsDispatch,
): void {
	const rateLimits = msg.rateLimits as RateLimits;
	const harness = msg.harness as HarnessKind | undefined;
	if (isPrimaryUsageAccount(harness)) d.setRateLimits(rateLimits);
	else if (harness) d.setHarnessRateLimits?.(harness, rateLimits);
}
