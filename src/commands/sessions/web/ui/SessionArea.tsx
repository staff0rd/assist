import { TerminalArea, type TerminalAreaProps } from "./TerminalArea";
import { TranscriptArea } from "./TranscriptArea";
import type { Transcript } from "./types";

export function SessionArea({
	viewingTranscriptSessionId,
	transcript,
	...terminal
}: TerminalAreaProps & {
	viewingTranscriptSessionId: string | null;
	transcript: Transcript | null;
}) {
	if (viewingTranscriptSessionId !== null)
		return (
			<TranscriptArea
				sessionId={viewingTranscriptSessionId}
				transcript={transcript}
			/>
		);

	return <TerminalArea {...terminal} />;
}
