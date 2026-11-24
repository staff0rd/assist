import type { SessionInfo } from "../../../../types";
import { QueuedRowActions } from "./QueuedRowActions";
import { TextRow } from "./TranscriptPane/TranscriptRow/TextRow";
import { useDequeueMessage } from "./useDequeueMessage";
import { useEditQueuedMessage } from "./useEditQueuedMessage";

export function SdkQueuedRows({ session }: { session: SessionInfo }) {
	const dequeue = useDequeueMessage();
	const edit = useEditQueuedMessage(session.id);
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
						onEdit={edit && (() => void edit(i, text))}
						onRemove={() => void dequeue(session.id, i, text)}
					/>
				)
			}
		/>
	));
}
