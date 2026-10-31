import { useCallback } from "react";
import type { Notices } from "../../App/AppShell/AppRoutes/UpdatesView/useUpdateActions/useNotices";
import { awaitNodeStatus } from "../../App/AppShell/awaitNodeStatus";
import type { NodeUpdateEntry } from "../../App/AppShell/NodeUpdateEntry";
import { postSelfUpdate } from "../../App/AppShell/postSelfUpdate";
import { requestFailure } from "../../App/AppShell/requestFailure";

function awaitUpdated(entry: NodeUpdateEntry) {
	const from = entry.status?.running;
	let wentDown = false;
	return awaitNodeStatus(entry, ({ status }) => {
		if (!status?.daemonReachable) {
			wentDown = true;
			return false;
		}
		return status.restart.length === 0 && (status.running !== from || wentDown);
	});
}

export function useSelfUpdate(notices: Notices, refresh: () => void) {
	const { mark, setBack, setError } = notices;
	return useCallback(
		async (entry: NodeUpdateEntry): Promise<void> => {
			mark(entry.name, "Updating");
			try {
				const res = await postSelfUpdate(entry.local ? undefined : entry.name);
				if (!res.ok) throw new Error(await requestFailure(res));
				mark(entry.name, "Restarting");
				const back = await awaitUpdated(entry);
				if (!back?.status) throw new Error(`${entry.name} did not come back`);
				setBack(`${entry.name} is running v${back.status.running}`);
			} catch (error) {
				setError(
					`Update ${entry.name} failed: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
			mark(entry.name);
			refresh();
		},
		[mark, setBack, setError, refresh],
	);
}
