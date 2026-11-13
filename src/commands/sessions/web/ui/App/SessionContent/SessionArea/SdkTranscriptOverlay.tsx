import Box from "@mui/material/Box";
import type { SessionInfo, Transcript } from "../../../types";
import {
	type FetchSessionTranscript,
	LiveTranscriptArea,
} from "./LiveTranscriptArea";

const overlaySx = {
	position: "absolute",
	inset: 0,
	zIndex: 1,
	display: "flex",
	bgcolor: "background.default",
} as const;

export function SdkTranscriptOverlay(props: {
	session: SessionInfo;
	transcript: Transcript | null;
	fetchSessionTranscript: FetchSessionTranscript;
}) {
	return (
		<Box sx={overlaySx}>
			<LiveTranscriptArea {...props} />
		</Box>
	);
}
