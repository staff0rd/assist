import { useState } from "react";
import type { Transcript, UserMessages } from "../../types";

export function useTranscriptState() {
	const [transcript, setTranscript] = useState<Transcript | null>(null);
	const [viewingTranscriptSessionId, setViewingTranscriptSessionId] = useState<
		string | null
	>(null);
	const [userMessages, setUserMessages] = useState<UserMessages | null>(null);
	return {
		transcript,
		setTranscript,
		viewingTranscriptSessionId,
		setViewingTranscriptSessionId,
		userMessages,
		setUserMessages,
	};
}
