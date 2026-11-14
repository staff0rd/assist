import type { SessionInfo, Transcript } from "../../../../types";
import { sdkComposerState } from "../SdkComposer/sdkComposerState";
import { formatToolElapsed } from "./formatToolElapsed";
import { SdkPendingRows } from "./SdkPendingRows";
import { SdkTailRow } from "./SdkTailRow";
import { TextRow } from "./TranscriptPane/TranscriptRow/TextRow";
import { TranscriptDivider } from "./TranscriptPane/TranscriptRow/TranscriptDivider";
import { useTickingSeconds } from "./useTickingSeconds";
import { processLine } from "./processLine";

function activityText(session: SessionInfo): string | undefined {
	if (session.status !== "running") return undefined;
	if (session.sdkInterrupting) return "Stopping turn…";
	return session.sdkActivity ?? "Working";
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
				<TranscriptDivider label="Daemon restarted" />
				<SdkTailRow text="Resuming conversation…" />
			</>
		);
	return (
		<>
			<SdkPendingRows session={session} transcript={transcript} />
			{session.sdkQueued?.map((text, i) => (
				<TextRow key={`${i}:${text}`} role="user" text={text} term="" queued />
			))}
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
