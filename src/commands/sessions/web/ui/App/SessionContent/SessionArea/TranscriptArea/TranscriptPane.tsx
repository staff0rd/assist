import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { TranscriptPlaceholder } from "./TranscriptPlaceholder";
import { TranscriptRow } from "./TranscriptPane/TranscriptRow";
import { useScrollToFirstMark } from "./TranscriptPane/useScrollToFirstMark";
import type { TranscriptMessage } from "../../../../types";

type KeyedMessage = TranscriptMessage & { key: string };

function messageKey(m: TranscriptMessage): string {
	if (m.role === "tool") return `tool:${m.tool}:${m.target}`;
	if (m.role === "interrupt") return "interrupt";
	return `${m.role}:${m.text.slice(0, 40)}`;
}

function withKeys(messages: TranscriptMessage[]): KeyedMessage[] {
	const counts = new Map<string, number>();
	return messages.map((m) => {
		const base = messageKey(m);
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
	commentLayer = (content) => content,
}: {
	messages: TranscriptMessage[];
	loading: boolean;
	term: string;
	tail?: ReactNode;
	follow?: boolean;
	commentLayer?: (content: ReactNode) => ReactNode;
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
						{withKeys(messages).map((m) => (
							<TranscriptRow key={m.key} message={m} term={term} />
						))}
						{tail}
					</>,
				)}
			</Box>
		</Box>
	);
}
