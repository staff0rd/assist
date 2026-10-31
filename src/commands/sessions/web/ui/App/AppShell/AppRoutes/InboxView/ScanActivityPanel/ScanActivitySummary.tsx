import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { statusPillSx } from "../../../../../designSystem/statusPillSx";
import type { InboxScanRun } from "../types";
import { formatScanElapsed } from "./formatScanElapsed";
import { useRunElapsed } from "./useRunElapsed";

const pill: Record<InboxScanRun["status"], { label: string; color: string }> = {
	scanning: { label: "Scanning", color: "info.main" },
	finished: { label: "Finished", color: "success.main" },
	failed: { label: "Failed", color: "error.main" },
};

const summarySx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	width: "100%",
	px: 2,
	py: 1.25,
	justifyContent: "flex-start",
	textAlign: "left",
} as const;

export function ScanActivitySummary({
	run,
	open,
	onToggle,
}: {
	run: InboxScanRun;
	open: boolean;
	onToggle: () => void;
}) {
	const elapsed = useRunElapsed(run);
	const { label, color } = pill[run.status];
	return (
		<ButtonBase sx={summarySx} onClick={onToggle} aria-expanded={open}>
			<ExpandMoreIcon
				fontSize="small"
				sx={{
					color: "text.secondary",
					transform: open ? "none" : "rotate(-90deg)",
					transition: "transform 0.15s",
				}}
			/>
			<Typography variant="subtitle2">Scan activity</Typography>
			<Box component="span" sx={statusPillSx(color)}>
				{label}
			</Box>
			<Typography
				variant="caption"
				color="text.secondary"
				sx={{ ml: "auto", fontFamily: "fontFamilyMono" }}
			>
				{formatScanElapsed(elapsed)}
			</Typography>
		</ButtonBase>
	);
}
