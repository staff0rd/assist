import type { ChildDismiss, SessionInfo } from "../types";

export function childDismissFor(
	session: SessionInfo,
	nestedSessions: SessionInfo[],
	onDismiss: (id: string) => void,
): ChildDismiss | undefined {
	if (nestedSessions.length === 0) return undefined;
	return {
		childCount: nestedSessions.length,
		onDismissAll: () => {
			for (const s of [session, ...nestedSessions]) onDismiss(s.id);
		},
	};
}
