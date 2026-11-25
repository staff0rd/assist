import type { SessionInfo, Transcript } from "../../../../types";
import { sdkComposerState } from "../SdkComposer/sdkComposerState";
import { SdkPendingRows } from "./SdkPendingRows";
import { SdkTailRow } from "./SdkTailRow";
import { TranscriptDivider } from "./TranscriptPane/TranscriptRow/TranscriptDivider";
import { useActivityRow } from "./useActivityRow";
import { WorkflowOutput } from "./WorkflowOutput";
import { processLine } from "./processLine";
import { SdkQueuedRows } from "./SdkQueuedRows";
import { SdkShellRows } from "./SdkShellRows";

function endsWithRestart(session: SessionInfo, transcript?: Transcript | null) {
	if (transcript?.sessionId !== session.id) return false;
	return transcript.messages.at(-1)?.role === "restart";
}

export function SdkTail({
	session,
	transcript,
}: {
	session: SessionInfo;
	transcript?: Transcript | null;
}) {
	const row = useActivityRow(session);
	if (session.seeding) return <SdkTailRow text={session.seeding} />;
	if (sdkComposerState(session).resuming)
		return (
			<>
				{!endsWithRestart(session, transcript) && (
					<TranscriptDivider label="Daemon restarted" />
				)}
				<SdkTailRow text="Resuming conversation…" />
			</>
		);
	return (
		<>
			<SdkPendingRows session={session} transcript={transcript} />
			<SdkShellRows session={session} />
			<SdkQueuedRows session={session} />
			{row && (
				<SdkTailRow
					text={row.text}
					suffix={row.suffix}
					process={processLine(session)}
				/>
			)}
			{row && session.sdkWorkflow && (
				<WorkflowOutput lines={session.sdkWorkflow.lines} />
			)}
			{session.sdkBackgroundTasks?.map((task, i) => (
				<SdkTailRow key={`${i}:${task}`} text={`Background · ${task}`} />
			))}
		</>
	);
}
