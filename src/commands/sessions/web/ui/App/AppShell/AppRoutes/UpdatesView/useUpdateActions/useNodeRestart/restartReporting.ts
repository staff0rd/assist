import type { NodeUpdateEntry } from "../../../../NodeUpdateEntry";
import type { RestartTarget } from "../../../../postRestart";
import type { Notices } from "../useNotices";
import { restartRemotely } from "./restartReporting/restartRemotely";

export async function restartReporting(
	entry: NodeUpdateEntry,
	target: RestartTarget,
	notices: Notices,
): Promise<void> {
	try {
		const running = await restartRemotely(
			entry,
			target,
			entry.status?.restart ?? [],
		);
		notices.setBack(`${entry.name} is running v${running}`);
	} catch (error) {
		notices.setError(
			`Restart ${entry.name} failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
