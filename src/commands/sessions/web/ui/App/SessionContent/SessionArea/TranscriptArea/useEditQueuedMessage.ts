import { useComposerDraft } from "../SdkComposer/useComposerDraft";
import { useDequeueMessage } from "./useDequeueMessage";

export function useEditQueuedMessage(sessionId: string) {
	const dequeue = useDequeueMessage();
	const drafts = useComposerDraft();
	if (!dequeue || !drafts) return undefined;
	return (index: number, text: string) =>
		dequeue(sessionId, index, text).then((removed) => {
			if (removed) drafts.append(sessionId, text);
		});
}
