import { useCallback } from "react";
import type { AutoUpdateAction } from "../../../../../../../shared/AutoUpdateAction";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";
import { canControl } from "../canControl";
import { postLoopControl } from "./useLoopControl/postLoopControl";
import type { Notices } from "./useNotices";

const CHECK_SETTLE_MS = 5_000;

const busyLabel: Record<AutoUpdateAction, string> = {
	pause: "Pausing",
	resume: "Resuming",
	check: "Checking",
};

export function useLoopControl(notices: Notices, refresh: () => void) {
	const { mark, setError, setBack } = notices;

	const control = useCallback(
		async (
			entry: NodeUpdateEntry,
			action: AutoUpdateAction,
		): Promise<boolean> => {
			mark(entry.name, busyLabel[action]);
			const failure = await postLoopControl(entry, action);
			if (failure)
				setError(`${busyLabel[action]} ${entry.name} failed: ${failure}`);
			mark(entry.name);
			refresh();
			if (!failure && action === "check") setTimeout(refresh, CHECK_SETTLE_MS);
			return !failure;
		},
		[mark, setError, refresh],
	);

	const checkAll = useCallback(
		async (entries: NodeUpdateEntry[]): Promise<void> => {
			const targets = entries.filter(
				(e) => canControl(e) && !e.status?.loop.paused,
			);
			const results = await Promise.all(
				targets.map((e) => control(e, "check")),
			);
			const checked = results.filter(Boolean).length;
			if (checked)
				setBack(
					`Checking ${checked} node${checked === 1 ? "" : "s"} against origin`,
				);
		},
		[control, setBack],
	);

	return { control, checkAll };
}
