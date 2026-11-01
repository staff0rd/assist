import { failStaleJobRuns } from "../../../shared/db/failStaleJobRuns";
import { getDb } from "../../../shared/db/getDb";
import { daemonLog } from "./daemonLog";

export async function failInterruptedJobRuns(
	startedBefore = new Date(),
): Promise<void> {
	try {
		const failed = await failStaleJobRuns(await getDb(), {
			startedBefore,
			detail: "Interrupted: the daemon restarted before it finished",
		});
		daemonLog(`jobs: marked ${failed} interrupted run(s) failed on start`);
	} catch (error) {
		daemonLog(`jobs: failing interrupted runs failed: ${String(error)}`);
	}
}
