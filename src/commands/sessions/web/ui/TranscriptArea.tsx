import Box from "@mui/material/Box";
import { TranscriptPane } from "./TranscriptPane";
import type { Transcript } from "./types";

export function TranscriptArea({
	sessionId,
	transcript,
}: {
	sessionId: string;
	transcript: Transcript | null;
}) {
	const ready = transcript?.sessionId === sessionId;
	return (
		<Box sx={{ flex: 1, position: "relative", bgcolor: "background.default" }}>
			<TranscriptPane
				messages={ready ? (transcript?.messages ?? []) : []}
				loading={!ready}
			/>
		</Box>
	);
}
