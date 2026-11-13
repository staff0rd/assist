import type { SessionInfo } from "../../../../types";
import { SdkTailRow } from "./SdkTailRow";
import { TextRow } from "./TranscriptPane/TranscriptRow/TextRow";

function activityText(session: SessionInfo): string | undefined {
	if (session.status !== "running") return undefined;
	if (session.sdkInterrupting) return "Stopping turn…";
	return session.sdkActivity ?? "Working";
}

export function SdkTail({ session }: { session: SessionInfo }) {
	const activity = activityText(session);
	return (
		<>
			{session.sdkQueued?.map((text, i) => (
				<TextRow key={`${i}:${text}`} role="user" text={text} term="" queued />
			))}
			{activity && <SdkTailRow text={activity} />}
		</>
	);
}
