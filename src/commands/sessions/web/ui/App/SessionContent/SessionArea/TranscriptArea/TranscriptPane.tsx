import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { TranscriptPlaceholder } from "./TranscriptPlaceholder";
import { useScrollToFirstMark } from "./TranscriptPane/useScrollToFirstMark";
import type { TranscriptMessage } from "../../../../types";
import { TranscriptItems } from "./TranscriptPane/TranscriptItems";
import type { OnTooVerbose } from "./TranscriptPane/useReplyActions";

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
	onTooVerbose?: OnTooVerbose;
}) {
	const scrollRef = useScrollToFirstMark(messages, term, follow);

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
						<TranscriptItems
							messages={messages}
							term={term}
							onTooVerbose={onTooVerbose}
						/>
						{tail}
					</>,
				)}
			</Box>
		</Box>
	);
}
