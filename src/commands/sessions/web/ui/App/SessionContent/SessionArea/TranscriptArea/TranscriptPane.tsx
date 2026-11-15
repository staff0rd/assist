import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { TranscriptPlaceholder } from "./TranscriptPlaceholder";
import { TranscriptRow } from "./TranscriptPane/TranscriptRow";
import { useScrollToFirstMark } from "./TranscriptPane/useScrollToFirstMark";
import type { TranscriptMessage } from "../../../../types";
import { groupToolRuns } from "./TranscriptPane/groupToolRuns";
import { ToolRunRow } from "./TranscriptPane/ToolRunRow";
import { useLastReplyAction } from "./TranscriptPane/useLastReplyAction";

export function TranscriptPane({
	messages,
	loading,
	term,
	tail,
	follow,
	commentLayer = (content) => content,
	onTooVerbose,
}: {
	messages: TranscriptMessage[];
	loading: boolean;
	term: string;
	tail?: ReactNode;
	follow?: boolean;
	commentLayer?: (content: ReactNode) => ReactNode;
	onTooVerbose?: () => void;
}) {
	const scrollRef = useScrollToFirstMark(messages, term, follow);
	const items = groupToolRuns(messages);
	const lastReplyAction = useLastReplyAction(items, onTooVerbose);

	if (loading || (messages.length === 0 && !tail))
		return <TranscriptPlaceholder loading={loading} />;

	return (
		<Box
			ref={scrollRef}
			sx={{ position: "absolute", inset: 0, overflowY: "auto", p: 2 }}
		>
			<Box sx={{ maxWidth: 820, mx: "auto" }}>
				{commentLayer(
					<>
						{items.map((item) =>
							item.kind === "tools" ? (
								<ToolRunRow key={item.key} calls={item.calls} />
							) : (
								<TranscriptRow
									key={item.message.key}
									message={item.message}
									term={term}
									actions={lastReplyAction(item.message.key)}
								/>
							),
						)}
						{tail}
					</>,
				)}
			</Box>
		</Box>
	);
}
