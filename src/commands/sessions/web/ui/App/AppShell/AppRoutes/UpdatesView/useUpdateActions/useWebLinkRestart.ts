import { useCallback } from "react";
import { RESTART_WEB_VIA_LINK_PATH } from "../../../../../../../shared/viaDaemonLinkPaths";
import { apiFetch } from "../../../../../apiFetch";
import { reportCaughtError } from "../../../../../clientFailures/reportCaughtError";
import { withNode } from "../../../../../withNode";
import { awaitNodeStatus } from "../../../awaitNodeStatus";
import type { NodeUpdateEntry } from "../../../NodeUpdateEntry";
import { requestFailure } from "../../../requestFailure";
import type { Notices } from "./useNotices";

async function restartViaLink(entry: NodeUpdateEntry): Promise<string> {
	let res: Response | undefined;
	try {
		res = await apiFetch(withNode(RESTART_WEB_VIA_LINK_PATH, entry.name), {
			method: "POST",
		});
	} catch (error) {
		reportCaughtError(error, "web server restart via daemon link");
	}
	if (!res?.ok) throw new Error(await requestFailure(res));
	const back = await awaitNodeStatus(entry, (next) => Boolean(next.status));
	if (!back?.status) throw new Error(`${entry.name} did not come back`);
	return back.status.running;
}

export function useWebLinkRestart(notices: Notices, refresh: () => void) {
	const restartWeb = useCallback(
		async (entry: NodeUpdateEntry): Promise<void> => {
			notices.mark(entry.name, "Restarting");
			try {
				const running = await restartViaLink(entry);
				notices.setBack(`${entry.name} is running v${running}`);
			} catch (error) {
				notices.setError(
					`Restart ${entry.name} web server failed: ${error instanceof Error ? error.message : String(error)}`,
				);
			}
			notices.mark(entry.name);
			refresh();
		},
		[notices, refresh],
	);
	return { restartWeb };
}
