import type { Session } from "./createSession";
import { dismissSessionGated } from "./dismissSessionGated";
import type { PrPreviewCoordinator } from "./PrPreviewCoordinator";

export function closeSession(
	sessions: Map<string, Session>,
	prPreview: PrPreviewCoordinator,
	notify: () => void,
	id: string,
	discard: boolean,
): void {
	prPreview.closeAll(id, discard ? "session discarded" : "session dismissed");
	dismissSessionGated(sessions, id, notify, discard);
}
