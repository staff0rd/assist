import { daemonLog } from "../daemonLog";
import type { SdkTurnTracker } from "./createSdkTurnTracker";
import type {
	DrivenSessionDriver,
	DrivenSessionContext,
} from "./DrivenSessionDriver";
import { runDrivenQuery } from "./runDrivenQuery";

export function startDrivenQuery(
	driver: DrivenSessionDriver,
	context: DrivenSessionContext,
	turn: SdkTurnTracker,
	backgroundTasks: boolean,
): void {
	const { label, control } = context;
	try {
		const query = driver.start(context);
		control.bind({
			send: turn.send,
			dequeue: turn.dequeue,
			interrupt: () => turn.interrupt(query.interrupt),
			...(backgroundTasks && query.stopTask && { stopTask: query.stopTask }),
		});
		void runDrivenQuery(query.events, label, control, turn, backgroundTasks);
	} catch (error) {
		daemonLog(
			`${label} sdk query not started: ${error instanceof Error ? error.message : String(error)}`,
		);
		control.exit(1);
	}
}
