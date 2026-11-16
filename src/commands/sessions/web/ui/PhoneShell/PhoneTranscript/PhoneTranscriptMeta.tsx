import Box from "@mui/material/Box";
import type { Theme } from "@mui/material/styles";
import { repoLabel } from "../../App/repoLabel";
import { formatRelativeTime } from "../../formatRelativeTime";
import type { HistoricalSession } from "../../types";
import { PhoneConversationIdChip } from "../PhoneConversationIdChip";

const metaSx = {
	flex: "none",
	display: "flex",
	flexWrap: "wrap",
	alignItems: "center",
	gap: 0.75,
	px: 2,
	pt: 0.25,
	pb: 1.25,
	fontSize: 13,
	color: "text.secondary",
	borderBottom: 1,
	borderColor: (t: Theme) => t.tokens.color.lineSoft,
} as const;

const dotSx = { color: "text.disabled" } as const;

function Dot() {
	return (
		<Box component="span" sx={dotSx} aria-hidden>
			·
		</Box>
	);
}

export function PhoneTranscriptMeta({ entry }: { entry: HistoricalSession }) {
	return (
		<Box sx={metaSx}>
			<span>{repoLabel(entry.cwd)}</span>
			<Dot />
			<span>{formatRelativeTime(entry.lastActivity ?? entry.timestamp)}</span>
			<Dot />
			<PhoneConversationIdChip
				conversationId={entry.sessionId}
				harness={entry.harness}
			/>
		</Box>
	);
}
