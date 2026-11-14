import type { TranscriptMessage } from "../../../../../types";
import { SentShellRow } from "../SentShellRow";
import { TextRow } from "./TranscriptRow/TextRow";
import { ToolRow } from "./TranscriptRow/ToolRow";
import { restartLabel } from "./TranscriptRow/restartLabel";
import { TranscriptDivider } from "./TranscriptRow/TranscriptDivider";

export function TranscriptRow({
	message,
	term,
}: {
	message: TranscriptMessage;
	term: string;
}) {
	if (message.role === "interrupt")
		return <TranscriptDivider label="Interrupted by you" />;
	if (message.role === "restart")
		return <TranscriptDivider label={restartLabel(message.killed)} />;
	if (message.role === "shell") return <SentShellRow {...message} />;
	if (message.role === "tool")
		return <ToolRow tool={message.tool} target={message.target} />;
	return <TextRow role={message.role} text={message.text} term={term} />;
}
