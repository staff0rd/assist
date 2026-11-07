import { startChainedSession } from "../../review/startChainedSession";
import type { PreviewStartTarget } from "../../sessions/shared/PreviewDecision";
import { requestAssistSession } from "../../sessions/shared/requestAssistSession";
import { formatItemId } from "../formatItemId";

export function startProposedRun(
	id: number,
	startOn?: PreviewStartTarget,
): Promise<void> {
	const itemId = formatItemId(id);
	const args = ["backlog", "run", itemId];
	return startChainedSession(`a backlog run session for ${itemId}`, () =>
		startOn
			? requestAssistSession(args, startOn.cwd, { node: startOn.node })
			: requestAssistSession(args, process.cwd()),
	);
}
