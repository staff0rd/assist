import { useState } from "react";
import type { Transcript } from "./types";

export function useTranscriptState() {
	const [transcript, setTranscript] = useState<Transcript | null>(null);
	const [viewingTranscriptSessionId, setViewingTranscriptSessionId] = useState<
		string | null
	>(null);
	return {
		transcript,
		setTranscript,
		viewingTranscriptSessionId,
		setViewingTranscriptSessionId,
	};
}
