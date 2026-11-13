import {
	ActiveSessionArea,
	type ActiveSessionAreaProps,
} from "./SessionArea/ActiveSessionArea";
import { TranscriptArea } from "./SessionArea/TranscriptArea";

export function SessionArea({
	viewingTranscriptSessionId,
	...active
}: ActiveSessionAreaProps & { viewingTranscriptSessionId: string | null }) {
	if (viewingTranscriptSessionId !== null)
		return (
			<TranscriptArea
				sessionId={viewingTranscriptSessionId}
				transcript={active.transcript}
			/>
		);
	return <ActiveSessionArea {...active} />;
}
