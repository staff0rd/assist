import type { SessionInfo } from "../../../../types";
import { QueuedRowActions } from "./QueuedRowActions";
import { TextRow } from "./TranscriptPane/TranscriptRow/TextRow";
import { useDequeueMessage } from "./useDequeueMessage";

export function SdkQueuedRows({ session }: { session: SessionInfo }) {
	const dequeue = useDequeueMessage();
	return session.sdkQueued?.map((text, i) => (
		<TextRow
			key={`${i}:${text}`}
			role="user"
			text={text}
			term=""
			queued
			actions={
				dequeue && (
					<QueuedRowActions onRemove={() => dequeue(session.id, i, text)} />
				)
			}
		/>
	));
}
