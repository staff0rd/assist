import type { Session } from "./types";

/* why: superseding is for revising the same preview; a preview from another
 * command or target would silently drop the pending one's result, so it is
 * refused instead. Returns the conflicting pending preview's key. */
export function pendingPreviewConflict(
	session: Session,
	previewKey: string | undefined,
): string | undefined {
	const pending = session.pendingPrPreview;
	if (
		pending &&
		pending.kind !== "show" &&
		session.pendingPreviewKey !== previewKey
	)
		return session.pendingPreviewKey ?? pending.title;
	const deferred = session.deferredCommands?.find(
		(c) => c.previewKey !== previewKey,
	);
	return deferred
		? (deferred.previewKey ?? deferred.argv.join(" "))
		: undefined;
}
