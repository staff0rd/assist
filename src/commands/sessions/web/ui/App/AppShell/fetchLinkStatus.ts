import type { AutoUpdateReply } from "../../../../shared/AutoUpdateLoopState";
import { LINK_UPDATE_STATUS_PATH } from "../../../../shared/viaDaemonLinkPaths";
import { apiFetch } from "../../apiFetch";
import { reportCaughtError } from "../../clientFailures/reportCaughtError";
import { withNode } from "../../withNode";

export async function fetchLinkStatus(
	name: string,
): Promise<AutoUpdateReply | undefined> {
	try {
		const res = await apiFetch(withNode(LINK_UPDATE_STATUS_PATH, name), {
			signal: AbortSignal.timeout(10_000),
		});
		return res.ok ? ((await res.json()) as AutoUpdateReply) : undefined;
	} catch (error) {
		reportCaughtError(error, "daemon link update status");
		return undefined;
	}
}
