import { useEffect } from "react";
import { failLaunch, type PendingLaunch } from "../../../PendingLaunch";

const LAUNCH_TIMEOUT_MS = 60_000;
const LAUNCH_TIMEOUT_MESSAGE = "Launch timed out — the session did not start.";

export function useLaunchTimeouts(
	pendingLaunches: PendingLaunch[],
	update: (fn: (list: PendingLaunch[]) => PendingLaunch[]) => void,
) {
	useEffect(() => {
		const launching = pendingLaunches.filter((l) => l.status === "launching");
		if (launching.length === 0) return;
		const timers = launching.map((l) =>
			setTimeout(
				() => update((list) => failLaunch(list, l.id, LAUNCH_TIMEOUT_MESSAGE)),
				Math.max(0, LAUNCH_TIMEOUT_MS - (Date.now() - l.startedAt)),
			),
		);
		return () => timers.forEach(clearTimeout);
	}, [pendingLaunches, update]);
}
