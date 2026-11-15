import type { SdkSessionControl } from "./createSdkSessionProcess";
import type { SdkTurnTracker } from "./createSdkTurnTracker";
import type { DrivenTurnEvent } from "./DrivenTurnEvent";

export function applyDrivenTurnEvent(
	event: DrivenTurnEvent,
	control: SdkSessionControl,
	turn: SdkTurnTracker,
	backgroundTasks: boolean,
): void {
	if (event.kind === "status") turn.setStatus(event.status);
	else if (event.kind === "activity") turn.setActivity(event.text);
	else if (event.kind === "elapsed") turn.setElapsed(event.seconds);
	else if (event.kind === "suggestion")
		control.emit({ kind: "suggestion", text: event.text });
	else if (backgroundTasks)
		control.emit({ kind: "background", tasks: event.tasks });
}
