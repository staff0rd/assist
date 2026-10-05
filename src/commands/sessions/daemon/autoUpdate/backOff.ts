import type { AutoUpdateDeps } from "./AutoUpdateDeps";

export const RETRY_AFTER_FAILURE_MS = 5 * 60 * 1000;

export async function backOff(
	reason: string,
	deps: AutoUpdateDeps,
): Promise<void> {
	deps.enter("retrying", { reason });
	deps.note(`${reason}; retrying in ${RETRY_AFTER_FAILURE_MS / 60000}m`);
	await deps.sleep(RETRY_AFTER_FAILURE_MS);
}
