import Box from "@mui/material/Box";
import { PrPreviewPane } from "./PrPreviewPane";
import { TerminalArea, type TerminalAreaProps } from "./TerminalArea";
import { TranscriptArea } from "./TranscriptArea";
import type { Transcript } from "./types";

type SendPrDecision = (
	sessionId: string,
	requestId: string,
	decision: "approve" | "reject",
	reason?: string,
) => void;

export function SessionArea({
	viewingTranscriptSessionId,
	transcript,
	sendPrDecision,
	...terminal
}: TerminalAreaProps & {
	viewingTranscriptSessionId: string | null;
	transcript: Transcript | null;
	sendPrDecision: SendPrDecision;
}) {
	if (viewingTranscriptSessionId !== null)
		return (
			<TranscriptArea
				sessionId={viewingTranscriptSessionId}
				transcript={transcript}
			/>
		);

	const activeSession = terminal.sessions.find(
		(s) => s.id === terminal.activeId,
	);
	const preview = activeSession?.pendingPrPreview;
	if (!activeSession || !preview) return <TerminalArea {...terminal} />;

	return (
		<Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
			<TerminalArea {...terminal} />
			<PrPreviewPane
				preview={preview}
				onApprove={() =>
					sendPrDecision(activeSession.id, preview.requestId, "approve")
				}
				onReject={() =>
					sendPrDecision(activeSession.id, preview.requestId, "reject")
				}
			/>
		</Box>
	);
}
