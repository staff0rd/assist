import { closeChildServerRuns } from "./closeChildServerRuns";
import type { Session } from "./createSession";
import { dismissSessionGated } from "./dismissSessionGated";
import type { PrPreviewCoordinator } from "./PrPreviewCoordinator";

export function closeSession(
	sessions: Map<string, Session>,
	prPreview: PrPreviewCoordinator,
	notify: () => void,
	id: string,
	discard: boolean,
	{ closeServerRuns = false }: { closeServerRuns?: boolean } = {},
): void {
	if (closeServerRuns)
		closeChildServerRuns(sessions, id, (childId) =>
			closeSession(sessions, prPreview, notify, childId, false),
		);
	prPreview.closeAll(id, discard ? "session discarded" : "session dismissed");
	dismissSessionGated(sessions, id, notify, discard);
}
