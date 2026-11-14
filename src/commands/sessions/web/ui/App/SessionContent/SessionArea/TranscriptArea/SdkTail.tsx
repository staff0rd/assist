import type { SessionInfo, Transcript } from "../../../../types";
import { sdkComposerState } from "../SdkComposer/sdkComposerState";
import { formatToolElapsed } from "./formatToolElapsed";
import { SdkPendingRows } from "./SdkPendingRows";
import { SdkTailRow } from "./SdkTailRow";
import { TranscriptDivider } from "./TranscriptPane/TranscriptRow/TranscriptDivider";
import { useTickingSeconds } from "./useTickingSeconds";
import { processLine } from "./processLine";
import { SdkQueuedRows } from "./SdkQueuedRows";

function activityText(session: SessionInfo): string | undefined {
	if (session.status !== "running") return undefined;
	if (session.sdkInterrupting) return "Stopping turn…";
	return session.sdkActivity ?? "Working";
}

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
	const activity = activityText(session);
	const elapsed = useTickingSeconds(
		activity && !session.sdkInterrupting
			? session.sdkActivityElapsed
			: undefined,
	);
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
			<SdkQueuedRows session={session} />
			{activity && (
				<SdkTailRow
					text={activity}
					suffix={
						elapsed === undefined ? undefined : formatToolElapsed(elapsed)
					}
					process={processLine(session)}
				/>
			)}
			{session.sdkBackgroundTasks?.map((task, i) => (
				<SdkTailRow key={`${i}:${task}`} text={`Background · ${task}`} />
			))}
		</>
	);
}
