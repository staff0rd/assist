import { useCallback, useRef, useState } from "react";
import {
	addLaunch,
	dismissLaunch,
	failOldestLaunching,
	type NewLaunchInput,
	oldestLaunching,
	type PendingLaunch,
	type ResolvedLaunch,
	resolveOldestLaunching,
} from "../../PendingLaunch";
import { useLaunchTimeouts } from "./usePendingLaunches/useLaunchTimeouts";

export function usePendingLaunches() {
	const [pendingLaunches, setPendingLaunches] = useState<PendingLaunch[]>([]);
	const launchesRef = useRef<PendingLaunch[]>([]);

	const update = useCallback(
		(fn: (list: PendingLaunch[]) => PendingLaunch[]) => {
			launchesRef.current = fn(launchesRef.current);
			setPendingLaunches(launchesRef.current);
		},
		[],
	);

	const addPendingLaunch = useCallback(
		(input: NewLaunchInput) => {
			update((list) =>
				addLaunch(list, {
					id: crypto.randomUUID(),
					startedAt: Date.now(),
					...input,
				}),
			);
		},
		[update],
	);

	const resolvePendingLaunch = useCallback((): ResolvedLaunch => {
		const resolved = oldestLaunching(launchesRef.current);
		update(resolveOldestLaunching);
		return {
			title: resolved?.named ? resolved.title : undefined,
			open: resolved?.open === true,
		};
	}, [update]);

	const failPendingLaunch = useCallback(
		(message: string) => update((list) => failOldestLaunching(list, message)),
		[update],
	);

	const dismissPendingLaunch = useCallback(
		(id: string) => update((list) => dismissLaunch(list, id)),
		[update],
	);

	useLaunchTimeouts(pendingLaunches, update);

	return {
		pendingLaunches,
		addPendingLaunch,
		resolvePendingLaunch,
		failPendingLaunch,
		dismissPendingLaunch,
	};
}
