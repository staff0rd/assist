import { useCallback, useEffect, useState } from "react";
import {
	addLaunch,
	dismissLaunch,
	failLaunch,
	failOldestLaunching,
	type PendingLaunch,
	resolveOldestLaunching,
} from "./PendingLaunch";

const LAUNCH_TIMEOUT_MS = 60_000;
const LAUNCH_TIMEOUT_MESSAGE = "Launch timed out — the session did not start.";

export function usePendingLaunches() {
	const [pendingLaunches, setPendingLaunches] = useState<PendingLaunch[]>([]);

	const addPendingLaunch = useCallback(
		(input: { cwd?: string; title: string }) => {
			setPendingLaunches((list) =>
				addLaunch(list, {
					id: crypto.randomUUID(),
					startedAt: Date.now(),
					...input,
				}),
			);
		},
		[],
	);

	const resolvePendingLaunch = useCallback(
		() => setPendingLaunches(resolveOldestLaunching),
		[],
	);

	const failPendingLaunch = useCallback(
		(message: string) =>
			setPendingLaunches((list) => failOldestLaunching(list, message)),
		[],
	);

	const dismissPendingLaunch = useCallback(
		(id: string) => setPendingLaunches((list) => dismissLaunch(list, id)),
		[],
	);

	useEffect(() => {
		const launching = pendingLaunches.filter((l) => l.status === "launching");
		if (launching.length === 0) return;
		const timers = launching.map((l) =>
			setTimeout(
				() =>
					setPendingLaunches((list) =>
						failLaunch(list, l.id, LAUNCH_TIMEOUT_MESSAGE),
					),
				Math.max(0, LAUNCH_TIMEOUT_MS - (Date.now() - l.startedAt)),
			),
		);
		return () => timers.forEach(clearTimeout);
	}, [pendingLaunches]);

	return {
		pendingLaunches,
		addPendingLaunch,
		resolvePendingLaunch,
		failPendingLaunch,
		dismissPendingLaunch,
	};
}
