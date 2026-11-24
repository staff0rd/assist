import type { SessionInfo } from "../../../../types";
import { useEditQueuedMessage } from "../TranscriptArea/useEditQueuedMessage";

export function useRecallQueued(
	session: SessionInfo,
	text: string,
	shell: boolean,
): (() => void) | undefined {
	const edit = useEditQueuedMessage(session.id);
	const queued = session.sdkQueued ?? [];
	if (!edit || text || shell || queued.length === 0) return undefined;
	const index = queued.length - 1;
	return () => void edit(index, queued[index]);
}
