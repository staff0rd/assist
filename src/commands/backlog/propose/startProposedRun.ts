import { startChainedSession } from "../../review/startChainedSession";
import { requestAssistSession } from "../../sessions/shared/requestAssistSession";
import { formatItemId } from "../formatItemId";
import type { StartApproval } from "./toStartApproval";

export function startProposedRun(
	id: number,
	{ startOn, yolo }: Omit<StartApproval, "autostart">,
	cwd: string = process.cwd(),
): Promise<void> {
	const itemId = formatItemId(id);
	const args = ["backlog", "run", itemId];
	const options =
		startOn || yolo
			? { ...(startOn && { node: startOn.node }), ...(yolo && { yolo }) }
			: undefined;
	return startChainedSession(`a backlog run session for ${itemId}`, () =>
		requestAssistSession(args, startOn?.cwd ?? cwd, options),
	);
}
