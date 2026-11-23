import Box from "@mui/material/Box";
import type { AutopilotTick } from "../../../../../../daemon/autopilot/AutopilotRecord";
import { itemRowSx } from "./itemRowSx";
import { lastRunHeading } from "./lastRunHeading";

const rowSx = {
	display: "grid",
	gap: 0.75,
	px: 2,
	py: 1.5,
	"& + &": { borderTop: 1, borderColor: "divider" },
} as const;

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
		<Box sx={rowSx}>
			<Box>
				<Box component="span" sx={{ fontWeight: 500 }}>
					{lastRunHeading(run)}
				</Box>
				{!summary && (
					<Box component="span" sx={{ color: "text.secondary" }}>
						{" · no summary recorded"}
					</Box>
				)}
			</Box>
			{summary && (
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
			)}
		</Box>
	);
}
