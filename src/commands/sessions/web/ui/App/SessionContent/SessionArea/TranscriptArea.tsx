import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { TranscriptPane } from "./TranscriptArea/TranscriptPane";
import type { Transcript } from "../../../types";
import { useTranscriptHighlightTerm } from "../../useHistorySearchQuery";

export function TranscriptArea({
	sessionId,
	transcript,
	tail,
	follow,
}: {
	sessionId: string;
	transcript: Transcript | null;
	tail?: ReactNode;
	follow?: boolean;
}) {
	const term = useTranscriptHighlightTerm();
	const ready = transcript?.sessionId === sessionId;
	return (
		<Box sx={{ flex: 1, position: "relative", bgcolor: "background.default" }}>
			<TranscriptPane
				messages={ready ? (transcript?.messages ?? []) : []}
				loading={!ready}
				term={term}
				tail={tail}
				follow={follow}
			/>
		</Box>
	);
}
