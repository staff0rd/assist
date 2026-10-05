import { useCallback } from "react";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";
import { useWebserverRestart } from "../../../useWebserverRestart";
import { updateState } from "../updateState";
import type { Notices } from "./useNotices";
import { reloadsThisPage } from "./useNodeRestart/reloadsThisPage";
import { restartReporting } from "./useNodeRestart/restartReporting";
import { restartTargetFor } from "./useNodeRestart/restartTargetFor";

export function useNodeRestart(
	reconnecting: boolean,
	notices: Notices,
	refresh: () => void,
) {
	const localWeb = useWebserverRestart("webserver", reconnecting);

	const restart = useCallback(
		async (entry: NodeUpdateEntry): Promise<void> => {
			const target = restartTargetFor(entry.status?.restart ?? []);
			if (!target) return;
			notices.mark(entry.name, "Restarting");
			if (reloadsThisPage(entry)) return localWeb.restartTo(target);
			await restartReporting(entry, target, notices);
			notices.mark(entry.name);
			refresh();
		},
		[localWeb, notices, refresh],
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
		localError: localWeb.error,
		clearLocalError: localWeb.clearError,
	};
}
