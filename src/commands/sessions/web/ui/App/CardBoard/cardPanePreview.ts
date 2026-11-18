import type { SessionInfo } from "../../types";

export function cardPanePreview(session: SessionInfo) {
	return session.pendingPrPreview ?? session.pendingShow;
}
