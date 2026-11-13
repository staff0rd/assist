import { daemonLog } from "../daemonLog";

export function createSdkInterrupt(
	label: string,
	setInterrupting: (pending: boolean) => void,
) {
	let interrupting = false;
	const set = (pending: boolean) => {
		if (pending === interrupting) return;
		interrupting = pending;
		setInterrupting(pending);
	};
	return {
		clear: () => set(false),
		request: (busy: boolean, request: () => Promise<void>) => {
			if (!busy || interrupting) {
				daemonLog(
					`${label} sdk interrupt ignored: ${interrupting ? "already interrupting" : "no turn running"}`,
				);
				return;
			}
			daemonLog(`${label} sdk interrupt requested`);
			set(true);
			request().then(
				() => daemonLog(`${label} sdk interrupt accepted`),
				(error: unknown) => {
					daemonLog(
						`${label} sdk interrupt failed: ${error instanceof Error ? error.message : String(error)}`,
					);
					set(false);
				},
			);
		},
	};
}
