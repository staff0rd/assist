import { unseenPendingTexts } from "../../../../../../shared/unseenPendingTexts";
import type { SessionInfo, Transcript } from "../../../../types";
import { TextRow } from "./TranscriptPane/TranscriptRow/TextRow";

export function SdkPendingRows({
	session,
	transcript,
}: {
	session: SessionInfo;
	transcript?: Transcript | null;
}) {
	const pending = unseenPendingTexts(
		session.sdkPending,
		transcript?.sessionId === session.id ? transcript.messages : [],
	);
	return pending.map((text, i) => (
		<TextRow key={`${i}:${text}`} role="user" text={text} term="" />
	));
}
