import type { HarnessKind } from "../../../../shared/harnesses";
import type { RateLimits } from "../../../../shared/RateLimits";
import type { WsDispatch } from "./WsDispatch";

export function handleLimits(
	msg: Record<string, unknown>,
	d: WsDispatch,
): void {
	const rateLimits = msg.rateLimits as RateLimits;
	const harness = msg.harness as HarnessKind | undefined;
	if (!harness || harness === "claude") d.setRateLimits(rateLimits);
	else d.setHarnessRateLimits?.(harness, rateLimits);
}
