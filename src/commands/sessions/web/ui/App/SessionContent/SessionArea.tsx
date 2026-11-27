import {
	ActiveSessionArea,
	type ActiveSessionAreaProps,
} from "./SessionArea/ActiveSessionArea";
import { TranscriptArea } from "./SessionArea/TranscriptArea";
import type { Transcript } from "../../types";

export function SessionArea({
	viewingTranscriptSessionId,
	transcript,
	...active
}: ActiveSessionAreaProps & {
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
	return <ActiveSessionArea {...active} />;
}
