import { daemonLog } from "../daemonLog";
import { applyDrivenTurnEvent } from "./applyDrivenTurnEvent";
import type { SdkSessionControl } from "./createSdkSessionProcess";
import type { SdkTurnTracker } from "./createSdkTurnTracker";
import type { DrivenTurnEvent } from "./DrivenTurnEvent";

export async function runDrivenQuery(
	events: AsyncIterable<DrivenTurnEvent>,
	label: string,
	control: SdkSessionControl,
	turn: SdkTurnTracker,
	backgroundTasks: boolean,
): Promise<void> {
	try {
		for await (const event of events)
			applyDrivenTurnEvent(event, control, turn, backgroundTasks);
		daemonLog(`${label} sdk query finished`);
		control.exit(0);
	} catch (error) {
		if (control.aborted()) {
			daemonLog(`${label} sdk query stopped after kill`);
			control.exit(0);
			return;
		}
		daemonLog(
			`${label} sdk query failed: ${error instanceof Error ? error.message : String(error)}`,
		);
		control.exit(1);
	} finally {
		turn.stopProcessWatch();
	}
}
