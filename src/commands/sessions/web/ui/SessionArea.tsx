import type { PrPreviewComment } from "../../shared/SessionInfoBase";
import { PrPreviewSplit } from "./PrPreviewSplit";
import { TerminalArea, type TerminalAreaProps } from "./TerminalArea";
import { TranscriptArea } from "./TranscriptArea";
import type { Transcript } from "./types";

type SendPrDecision = (
	sessionId: string,
	requestId: string,
	decision: "approve" | "reject",
	reason?: string,
	comments?: PrPreviewComment[],
	screenshots?: string[],
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
	const preview = activeSession?.pendingPrPreview ?? null;

	return (
		<PrPreviewSplit
			preview={preview}
			cwd={activeSession?.cwd}
			onDecision={(requestId, decision, comments, screenshots) => {
				if (activeSession)
					sendPrDecision(
						activeSession.id,
						requestId,
						decision,
						undefined,
						comments,
						screenshots,
					);
			}}
		>
			<TerminalArea {...terminal} />
		</PrPreviewSplit>
	);
}
