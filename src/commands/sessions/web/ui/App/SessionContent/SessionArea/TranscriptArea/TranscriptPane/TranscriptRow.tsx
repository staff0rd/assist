import type { TranscriptMessage } from "../../../../../types";
import { TextRow } from "./TranscriptRow/TextRow";
import { ToolRow } from "./TranscriptRow/ToolRow";
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
	if (message.role === "tool")
		return <ToolRow tool={message.tool} target={message.target} />;
	return <TextRow role={message.role} text={message.text} term={term} />;
}
