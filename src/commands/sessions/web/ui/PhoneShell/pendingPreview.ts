import type { SessionInfo } from "../types";

const NATIVE_CARD_KINDS = new Set(["question", "check"]);

export function pendingPreview(session: SessionInfo) {
	if (session.pendingShow) return session.pendingShow;
	const preview = session.pendingPrPreview;
	if (!preview || NATIVE_CARD_KINDS.has(preview.kind ?? "pr")) return undefined;
	return preview;
}
