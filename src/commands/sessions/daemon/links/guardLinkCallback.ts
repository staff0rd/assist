import { daemonLog } from "../daemonLog";

export function guardLinkCallback<Args extends unknown[]>(
	label: string,
	callback: (...args: Args) => void,
): (...args: Args) => void {
	return (...args) => {
		try {
			callback(...args);
		} catch (error) {
			daemonLog(
				`${label} threw; ignored so the daemon keeps running: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	};
}
