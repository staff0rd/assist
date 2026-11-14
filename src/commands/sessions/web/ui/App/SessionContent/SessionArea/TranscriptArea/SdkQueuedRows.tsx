import type { SessionInfo } from "../../../../types";
import { useComposerDraft } from "../SdkComposer/useComposerDraft";
import { QueuedRowActions } from "./QueuedRowActions";
import { TextRow } from "./TranscriptPane/TranscriptRow/TextRow";
import { useDequeueMessage } from "./useDequeueMessage";

export function SdkQueuedRows({ session }: { session: SessionInfo }) {
	const dequeue = useDequeueMessage();
	const drafts = useComposerDraft();
	const edit = (index: number, text: string) =>
		dequeue?.(session.id, index, text).then((removed) => {
			if (removed) drafts?.append(session.id, text);
		});
	return session.sdkQueued?.map((text, i) => (
		<TextRow
			key={`${i}:${text}`}
			role="user"
			text={text}
			term=""
			queued
			actions={
				dequeue && (
					<QueuedRowActions
						onEdit={drafts && (() => void edit(i, text))}
						onRemove={() => void dequeue(session.id, i, text)}
					/>
				)
			}
		/>
	));
}
