import type { SessionInfo } from "../types";

export function pendingCheck(session: SessionInfo) {
	const preview = session.pendingPrPreview;
	return preview?.kind === "check" ? preview : undefined;
}
