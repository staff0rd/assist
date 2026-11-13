import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { TranscriptPlaceholder } from "./TranscriptPlaceholder";
import { TranscriptRow } from "./TranscriptPane/TranscriptRow";
import { useScrollToFirstMark } from "./TranscriptPane/useScrollToFirstMark";
import type { TranscriptMessage } from "../../../../types";

type KeyedMessage = TranscriptMessage & { key: string };

function withKeys(messages: TranscriptMessage[]): KeyedMessage[] {
	const counts = new Map<string, number>();
	return messages.map((m) => {
		const base =
			m.role === "tool"
				? `tool:${m.tool}:${m.target}`
				: `${m.role}:${m.text.slice(0, 40)}`;
		const n = counts.get(base) ?? 0;
		counts.set(base, n + 1);
		return { ...m, key: `${base}#${n}` };
	});
}

export function TranscriptPane({
	messages,
	loading,
	term,
	tail,
	follow,
}: {
	messages: TranscriptMessage[];
	loading: boolean;
	term: string;
	tail?: ReactNode;
	follow?: boolean;
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
				{withKeys(messages).map((m) => (
					<TranscriptRow key={m.key} message={m} term={term} />
				))}
				{tail}
			</Box>
		</Box>
	);
}
