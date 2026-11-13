import { type ReactNode, useEffect } from "react";
import type { SessionInfo, Transcript } from "../../../types";
import { TranscriptArea } from "./TranscriptArea";
import { SdkTail } from "./TranscriptArea/SdkTail";

export type FetchSessionTranscript = (sessionId: string) => void;
export type InterruptSession = (sessionId: string) => void;

export function LiveTranscriptArea({
	session,
	transcript,
	fetchSessionTranscript,
	commentLayer,
}: {
	session: SessionInfo;
	transcript: Transcript | null;
	fetchSessionTranscript: FetchSessionTranscript;
	commentLayer?: (content: ReactNode) => ReactNode;
}) {
	const { id, status, sdkActivity, lastUserMessage, lastAssistantMessage } =
		session;
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
	]);
	return (
		<TranscriptArea
			sessionId={id}
			transcript={transcript}
			tail={<SdkTail session={session} />}
			follow
			commentLayer={commentLayer}
		/>
	);
}
