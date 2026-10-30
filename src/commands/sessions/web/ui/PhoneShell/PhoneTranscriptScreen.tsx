import Box from "@mui/material/Box";
import { useEffect } from "react";
import { useParams } from "react-router";
import { TranscriptArea } from "../App/SessionContent/SessionArea/TranscriptArea";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneBackButton } from "./PhoneBackButton";
import { PhoneNavBar } from "./PhoneNavBar";

const bodySx = {
	flex: 1,
	minHeight: 0,
	display: "flex",
	pb: safeAreaInsets.bottom,
} as const;

export function PhoneTranscriptScreen({ socket }: { socket: SessionSocket }) {
	const { id = "" } = useParams();
	const { viewTranscript, clearTranscript } = socket;
	const entry = socket.history.find((h) => h.sessionId === id);

	useEffect(() => {
		viewTranscript(id);
		return clearTranscript;
	}, [id, viewTranscript, clearTranscript]);

	return (
		<>
			<PhoneNavBar
				left={<PhoneBackButton label="History" to="/history" />}
				title={entry?.title ?? entry?.name ?? "Transcript"}
			/>
			<Box sx={bodySx}>
				<TranscriptArea sessionId={id} transcript={socket.transcript} />
			</Box>
		</>
	);
}
