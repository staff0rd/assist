import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { InboxScanEvent } from "../types";
import { formatScanElapsed } from "./formatScanElapsed";
import { ScanRowTokens } from "./ScanRowTokens";

const labelColor: Record<InboxScanEvent["kind"], string> = {
	tool: "info.main",
	text: "text.secondary",
	result: "success.main",
	error: "error.main",
};

const rowSx = {
	display: "grid",
	gridTemplateColumns: { xs: "3.5em 9em 1fr", sm: "3.5em 9em 1fr auto" },
	gap: 1,
	py: 0.5,
	typography: "caption",
	alignItems: "baseline",
} as const;

export function ScanActivityRow({
	event,
	startedAt,
}: {
	event: InboxScanEvent;
	startedAt: string;
}) {
	const offset = Date.parse(event.at) - Date.parse(startedAt);
	return (
		<Box sx={rowSx}>
			<Typography
				component="span"
				sx={{ fontSize: "inherit", fontFamily: "fontFamilyMono" }}
				color="text.disabled"
			>
				{formatScanElapsed(Math.max(0, offset))}
			</Typography>
			<Typography
				component="span"
				sx={{
					fontSize: "inherit",
					fontWeight: 600,
					color: labelColor[event.kind],
				}}
				noWrap
			>
				{event.label}
			</Typography>
			<Typography
				component="span"
				sx={{
					fontSize: "inherit",
					fontFamily: event.kind === "tool" ? "fontFamilyMono" : undefined,
					color: event.kind === "error" ? "error.main" : "text.primary",
					overflowWrap: "anywhere",
					whiteSpace: "pre-wrap",
				}}
			>
				{event.detail}
			</Typography>
			<ScanRowTokens tokens={event.tokens} />
		</Box>
	);
}
