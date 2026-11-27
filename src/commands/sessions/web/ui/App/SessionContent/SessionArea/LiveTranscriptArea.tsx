import type { OnTooVerbose } from "./TranscriptArea/TranscriptPane/useReplyActions";
import { type ReactNode, useEffect } from "react";
import type { SessionInfo, Transcript } from "../../../types";
import { TranscriptArea } from "./TranscriptArea";
import { SdkTail } from "./TranscriptArea/SdkTail";
import { usePendingSendCount } from "./usePendingSendCount";

export type FetchSessionTranscript = (sessionId: string) => void;
export type InterruptSession = (sessionId: string) => void;

export function LiveTranscriptArea({
	session,
	transcript,
	fetchSessionTranscript,
	commentLayer,
	onTooVerbose,
}: {
	session: SessionInfo;
	transcript: Transcript | null;
	fetchSessionTranscript: FetchSessionTranscript;
	commentLayer?: (content: ReactNode) => ReactNode;
	onTooVerbose?: OnTooVerbose;
}) {
	const {
		id,
		status,
		sdkActivity,
		lastUserMessage,
		lastAssistantMessage,
		lastEchoAt,
		transcriptRevision,
	} = session;
	// why: the daemon broadcasts these as the transcript grows, so each change means new rows to fetch
	useEffect(() => {
		fetchSessionTranscript(id);
	}, [
		fetchSessionTranscript,
		id,
		status,
		sdkActivity,
		lastUserMessage,
		lastAssistantMessage,
		lastEchoAt,
		transcriptRevision,
	]);
	const sendCount = usePendingSendCount(session.sdkPending);
	return (
		<TranscriptArea
			sessionId={id}
			transcript={transcript}
			tail={<SdkTail session={session} transcript={transcript} />}
			follow
			followSignal={sendCount}
			commentLayer={commentLayer}
			onTooVerbose={onTooVerbose}
		/>
	);
}
