import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { TranscriptRow } from "./TranscriptRow";
import type { TranscriptMessage } from "./types";

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
}: {
	messages: TranscriptMessage[];
	loading: boolean;
}) {
	if (loading)
		return (
			<Box sx={centeredSx}>
				<CircularProgress size={20} />
				<Typography variant="caption" color="text.disabled">
					Loading transcript…
				</Typography>
			</Box>
		);

	if (messages.length === 0)
		return (
			<Box sx={centeredSx}>
				<Typography variant="body2" color="text.disabled">
					No transcript available
				</Typography>
			</Box>
		);

	return (
		<Box sx={{ position: "absolute", inset: 0, overflowY: "auto", p: 2 }}>
			<Box sx={{ maxWidth: 820, mx: "auto" }}>
				{withKeys(messages).map((m) => (
					<TranscriptRow key={m.key} message={m} />
				))}
			</Box>
		</Box>
	);
}

const centeredSx = {
	position: "absolute",
	inset: 0,
	display: "flex",
	flexDirection: "column",
	gap: 1.5,
	alignItems: "center",
	justifyContent: "center",
} as const;
