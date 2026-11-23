import Box from "@mui/material/Box";
import type { AutopilotTick } from "../../../../../../daemon/autopilot/AutopilotRecord";
import { itemRowSx } from "./itemRowSx";
import { lastRunHeading } from "./lastRunHeading";

const fieldsSx = {
	display: "grid",
	gridTemplateColumns: "auto 1fr",
	gap: "2px 12px",
	alignItems: "baseline",
} as const;

const LABELS = [
	["checked", "Checked"],
	["decided", "Decided"],
	["started", "Started"],
	["next", "Next"],
] as const;

export function RunHistoryRow({ run }: { run: AutopilotTick }) {
	const { summary } = run;
	return (
		<Box sx={[itemRowSx.row, { gridTemplateColumns: "1fr" }]}>
			<Box sx={{ fontWeight: 500 }}>{lastRunHeading(run)}</Box>
			{summary ? (
				<Box sx={fieldsSx}>
					{LABELS.map(([key, label]) => (
						<Box key={key} sx={{ display: "contents" }}>
							<Box
								component="span"
								sx={[itemRowSx.key, { typography: "caption" }]}
							>
								{label}
							</Box>
							<Box
								component="span"
								sx={{ color: "text.secondary", minWidth: 0 }}
							>
								{summary[key]}
							</Box>
						</Box>
					))}
				</Box>
			) : (
				<Box sx={itemRowSx.line}>The run recorded no summary.</Box>
			)}
		</Box>
	);
}
