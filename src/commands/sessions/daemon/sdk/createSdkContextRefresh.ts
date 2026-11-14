import { daemonLog } from "../daemonLog";
import type { SdkContextReader } from "./sdkContextReader";
import { sdkUsageSink } from "./sdkUsageSink";

/* why: a result only lands at the end of a turn, so the card's context % is
 * refreshed after every main-loop response, as the terminal status line does. */
export function createSdkContextRefresh(
	label: string,
	readContext: SdkContextReader | undefined,
) {
	let contextPct: number | undefined;
	let reading = false;
	const refresh = (claudeSessionId: string) => {
		if (!readContext || reading) return;
		reading = true;
		readContext()
			.then((pct) => {
				contextPct = Math.min(100, Math.round(pct));
				sdkUsageSink()?.usage(claudeSessionId, undefined, contextPct);
			})
			.catch((error: unknown) =>
				daemonLog(
					`${label} sdk context usage unavailable: ${error instanceof Error ? error.message : String(error)}`,
				),
			)
			.finally(() => {
				reading = false;
			});
	};
	return { refresh, latest: () => contextPct };
}
