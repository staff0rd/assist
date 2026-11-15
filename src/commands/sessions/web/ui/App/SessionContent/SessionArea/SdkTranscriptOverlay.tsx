import Box from "@mui/material/Box";
import { useRef } from "react";
import type { SessionInfo, Transcript } from "../../../types";
import {
	type FetchSessionTranscript,
	type InterruptSession,
	LiveTranscriptArea,
} from "./LiveTranscriptArea";
import { SdkComposer } from "./SdkComposer";
import { useFocusOnEmptyClick } from "./SdkTranscriptOverlay/useFocusOnEmptyClick";
import { TranscriptCommentLayer } from "./TranscriptCommentLayer";
import { tooVerbosePrompt } from "./tooVerbosePrompt";
import { pasteAndSubmit } from "../../../../../shared/pasteAndSubmit";

const overlaySx = {
	position: "absolute",
	inset: 0,
	zIndex: 1,
	display: "flex",
	flexDirection: "column",
	bgcolor: "background.default",
} as const;

const transcriptSx = { flex: 1, minHeight: 0, display: "flex" } as const;

export function SdkTranscriptOverlay({
	sendInput,
	interruptSession,
	...transcript
}: {
	session: SessionInfo;
	transcript: Transcript | null;
	fetchSessionTranscript: FetchSessionTranscript;
	sendInput: (sessionId: string, data: string) => void;
	interruptSession: InterruptSession;
}) {
	const composerRef = useRef<HTMLTextAreaElement | null>(null);
	const focusOnEmpty = useFocusOnEmptyClick(composerRef);
	return (
		<Box sx={overlaySx} {...focusOnEmpty}>
			<Box sx={transcriptSx}>
				<LiveTranscriptArea
					{...transcript}
					onTooVerbose={() =>
						pasteAndSubmit(sendInput, transcript.session.id, tooVerbosePrompt)
					}
					commentLayer={(content) => (
						<TranscriptCommentLayer
							session={transcript.session}
							sendInput={sendInput}
						>
							{content}
						</TranscriptCommentLayer>
					)}
				/>
			</Box>
			<SdkComposer
				key={transcript.session.id}
				session={transcript.session}
				sendInput={sendInput}
				interruptSession={interruptSession}
				inputRef={composerRef}
			/>
		</Box>
	);
}
