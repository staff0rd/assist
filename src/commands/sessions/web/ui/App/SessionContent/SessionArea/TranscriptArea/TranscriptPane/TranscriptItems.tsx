import type { TranscriptMessage } from "../../../../../types";
import { groupToolRuns } from "./groupToolRuns";
import { ToolRunRow } from "./ToolRunRow";
import { TranscriptRow } from "./TranscriptRow";
import { type OnTooVerbose, useReplyActions } from "./useReplyActions";

export function TranscriptItems({
	messages,
	term,
	onTooVerbose,
}: {
	messages: TranscriptMessage[];
	term: string;
	onTooVerbose?: OnTooVerbose;
}) {
	const items = groupToolRuns(messages);
	const replyActions = useReplyActions(items, onTooVerbose);
	return items.map((item) =>
		item.kind === "tools" ? (
			<ToolRunRow key={item.key} calls={item.calls} />
		) : (
			<TranscriptRow
				key={item.message.key}
				message={item.message}
				term={term}
				actions={replyActions(item)}
			/>
		),
	);
}
