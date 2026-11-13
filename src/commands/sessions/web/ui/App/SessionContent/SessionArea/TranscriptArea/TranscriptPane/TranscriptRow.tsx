import BuildIcon from "@mui/icons-material/Build";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { TranscriptMessage } from "../../../../../types";
import { TextRow } from "./TranscriptRow/TextRow";
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

function ToolRow({ tool, target }: { tool: string; target: string }) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5, pl: 1 }}>
			<BuildIcon sx={{ fontSize: 14, color: "text.disabled" }} />
			<Typography
				variant="caption"
				sx={{ color: "text.secondary", fontFamily: "fontFamilyMono" }}
			>
				<Box component="span" sx={{ color: "warning.main" }}>
					{tool}
				</Box>
				{target && <Box component="span"> {target}</Box>}
			</Typography>
		</Box>
	);
}
