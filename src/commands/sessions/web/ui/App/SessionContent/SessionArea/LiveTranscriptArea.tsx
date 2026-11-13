import { useEffect } from "react";
import type { SessionInfo, Transcript } from "../../../types";
import { TranscriptArea } from "./TranscriptArea";
import { SdkTailRow } from "./TranscriptArea/SdkTailRow";

export type FetchSessionTranscript = (sessionId: string) => void;

export function LiveTranscriptArea({
	session,
	transcript,
	fetchSessionTranscript,
}: {
	session: SessionInfo;
	transcript: Transcript | null;
	fetchSessionTranscript: FetchSessionTranscript;
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
	const tail =
		status === "running" ? (
			<SdkTailRow text={sdkActivity ?? "Working"} />
		) : undefined;
	return (
		<TranscriptArea sessionId={id} transcript={transcript} tail={tail} follow />
	);
}
