import { useCallback } from "react";

export function useTranscriptNavigation(
	send: (msg: object) => void,
	setActiveId: (id: string | null) => void,
	setViewingTranscriptSessionId: (id: string | null) => void,
) {
	const viewTranscript = useCallback(
		(sessionId: string) => {
			setViewingTranscriptSessionId(sessionId);
			send({ type: "fetch-transcript", sessionId });
		},
		[send, setViewingTranscriptSessionId],
	);

	const clearTranscript = useCallback(() => {
		setViewingTranscriptSessionId(null);
	}, [setViewingTranscriptSessionId]);

	// why: drop the transcript view even when the active id is unchanged
	const selectSession = useCallback(
		(id: string) => {
			setViewingTranscriptSessionId(null);
			setActiveId(id);
		},
		[setActiveId, setViewingTranscriptSessionId],
	);

	return { viewTranscript, clearTranscript, selectSession };
}
