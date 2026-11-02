import { useCallback } from "react";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";
import type { WebserverRestart } from "../../../useWebserverRestart";
import { updateState } from "../updateState";
import type { Notices } from "./useNotices";
import { reloadsThisPage } from "./useNodeRestart/reloadsThisPage";
import { restartReporting } from "./useNodeRestart/restartReporting";
import { restartTargetFor } from "./useNodeRestart/restartTargetFor";

export function useNodeRestart(
	localWeb: WebserverRestart,
	notices: Notices,
	refresh: () => void,
) {
	const { restartTo, error, clearError } = localWeb;

	const restart = useCallback(
		async (entry: NodeUpdateEntry): Promise<void> => {
			const target = restartTargetFor(entry.status?.restart ?? []);
			if (!target) return;
			notices.mark(entry.name, "Restarting");
			if (reloadsThisPage(entry))
				return restartTo(target === "daemon" ? "both" : target);
			await restartReporting(entry, target, notices);
			notices.mark(entry.name);
			refresh();
		},
		[restartTo, notices, refresh],
	);

	const restartReady = useCallback(
		async (entries: NodeUpdateEntry[]): Promise<void> => {
			const ready = entries.filter((e) => updateState(e).kind === "ready");
			await Promise.all(
				ready.filter((e) => !reloadsThisPage(e)).map((e) => restart(e)),
			);
			for (const entry of ready.filter(reloadsThisPage)) await restart(entry);
		},
		[restart],
	);

	return {
		restart,
		restartReady,
		localError: error,
		clearLocalError: clearError,
	};
}
