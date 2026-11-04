import type { ChildDismiss, SessionInfo } from "../types";

export function childDismissFor(
	session: SessionInfo,
	nestedSessions: SessionInfo[],
	onDismiss: (id: string) => void,
): ChildDismiss | undefined {
	if (nestedSessions.length === 0) return undefined;
	const onDismissChildren = () => {
		for (const s of nestedSessions) onDismiss(s.id);
	};
	return {
		childCount: nestedSessions.length,
		onDismissAll: () => {
			onDismiss(session.id);
			onDismissChildren();
		},
		onDismissChildren,
	};
}
