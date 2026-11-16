import Box from "@mui/material/Box";
import { useEffect } from "react";
import { useParams, useSearchParams } from "react-router";
import { TranscriptArea } from "../App/SessionContent/SessionArea/TranscriptArea";
import { safeAreaInsets } from "../designSystem/safeAreaInsets";
import type { SessionSocket } from "../useSessionSocket";
import { PhoneBackButton } from "./PhoneBackButton";
import { PhoneNavBar } from "./PhoneNavBar";
import { PhoneResumeButton } from "./PhoneTranscript/PhoneResumeButton";
import { PhoneResumingToast } from "./PhoneTranscript/PhoneResumingToast";
import { usePhoneResume } from "./PhoneTranscript/usePhoneResume";
import { transcriptTitle } from "./transcriptTitle";

const bodySx = {
	flex: 1,
	minHeight: 0,
	display: "flex",
	pb: safeAreaInsets.bottom,
} as const;

export function PhoneTranscriptScreen({ socket }: { socket: SessionSocket }) {
	const { id = "" } = useParams();
	const node = useSearchParams()[0].get("node") ?? undefined;
	const { viewTranscript, clearTranscript } = socket;
	const entry = socket.history.find(
		(h) => h.sessionId === id && h.node === node,
	);
	const { resuming, resume } = usePhoneResume(socket, entry);

	useEffect(() => {
		viewTranscript(id, node);
		return clearTranscript;
	}, [id, node, viewTranscript, clearTranscript]);

	return (
		<>
			<PhoneNavBar
				left={<PhoneBackButton />}
				title={transcriptTitle(entry)}
				right={
					<PhoneResumeButton disabled={!entry || resuming} onResume={resume} />
				}
			/>
			<Box sx={bodySx}>
				<TranscriptArea sessionId={id} transcript={socket.transcript} />
			</Box>
			<PhoneResumingToast open={resuming} />
		</>
	);
}
