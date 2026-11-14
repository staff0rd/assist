import { splitShellBlocks } from "../../../../../../shared/splitShellBlocks";
import { unseenPendingTexts } from "../../../../../../shared/unseenPendingTexts";
import type { SessionInfo, Transcript } from "../../../../types";
import { SentShellRow } from "./SentShellRow";
import { TextRow } from "./TranscriptPane/TranscriptRow/TextRow";

function PendingRow({ text }: { text: string }) {
	const split = splitShellBlocks(text);
	if (!split) return <TextRow role="user" text={text} term="" />;
	return (
		<>
			{split.shells.map((block, i) => (
				<SentShellRow key={`${i}:${block.command}`} {...block} />
			))}
			{split.text && <TextRow role="user" text={split.text} term="" />}
		</>
	);
}

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
		<PendingRow key={`${i}:${text}`} text={text} />
	));
}
