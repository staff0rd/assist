import { applySession } from "./applySession";
import { backlogSession } from "./backlogSession";
import { refineSession } from "./refineSession";
import type { ReviewSession } from "./ReviewSession";

type SessionModes = { backlog?: boolean; apply?: boolean; refine?: boolean };

export function postSynthesisSession(
	modes: SessionModes,
): ReviewSession | null {
	if (modes.backlog) return backlogSession;
	if (modes.apply) return applySession;
	if (modes.refine) return refineSession;
	return null;
}
