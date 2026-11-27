import { useCallback, useState } from "react";
import type { LiveTranscripts, Transcript, UserMessages } from "../../types";

export function useTranscriptState() {
	const [transcript, setTranscript] = useState<Transcript | null>(null);
	const [liveTranscripts, setLiveTranscripts] = useState<LiveTranscripts>({});
	const [viewingTranscriptSessionId, setViewingTranscriptSessionId] = useState<
		string | null
	>(null);
	const [userMessages, setUserMessages] = useState<UserMessages | null>(null);
	const setLiveTranscript = useCallback(
		(t: Transcript) =>
			setLiveTranscripts((prev) => ({ ...prev, [t.sessionId]: t })),
		[],
	);
	return {
		transcript,
		setTranscript,
		liveTranscripts,
		setLiveTranscript,
		viewingTranscriptSessionId,
		setViewingTranscriptSessionId,
		userMessages,
		setUserMessages,
	};
}
