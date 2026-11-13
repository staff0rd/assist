import type { SessionInfo } from "../../../../types";
import { sdkComposerState } from "../SdkComposer/sdkComposerState";
import { SdkTailRow } from "./SdkTailRow";
import { TextRow } from "./TranscriptPane/TranscriptRow/TextRow";
import { TranscriptDivider } from "./TranscriptPane/TranscriptRow/TranscriptDivider";

function activityText(session: SessionInfo): string | undefined {
	if (session.status !== "running") return undefined;
	if (session.sdkInterrupting) return "Stopping turn…";
	return session.sdkActivity ?? "Working";
}

export function SdkTail({ session }: { session: SessionInfo }) {
	if (sdkComposerState(session).resuming)
		return (
			<>
				<TranscriptDivider label="Daemon restarted" />
				<SdkTailRow text="Resuming conversation…" />
			</>
		);
	const activity = activityText(session);
	return (
		<>
			{session.sdkQueued?.map((text, i) => (
				<TextRow key={`${i}:${text}`} role="user" text={text} term="" queued />
			))}
			{activity && <SdkTailRow text={activity} />}
			{session.sdkBackgroundTasks?.map((task, i) => (
				<SdkTailRow key={`${i}:${task}`} text={`Background · ${task}`} />
			))}
		</>
	);
}
