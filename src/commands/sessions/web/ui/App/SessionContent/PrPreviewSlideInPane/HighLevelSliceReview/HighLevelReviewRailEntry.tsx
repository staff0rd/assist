import { Box, ButtonBase } from "@mui/material";
import { HighLevelLineCounts } from "../HighLevelLineCounts";
import type { HighLevelTick } from "./highLevelEntryTicks";
import { HighLevelRailEntryLabel } from "./HighLevelRailEntryLabel";
import type { HighLevelReviewEntry } from "./highLevelReviewEntries";
import { HighLevelTickDots } from "./HighLevelTickDots";

const entrySx = (current: boolean) =>
	({
		display: "grid",
		gridTemplateColumns: "22px minmax(0, 1fr) auto",
		columnGap: 1,
		alignItems: "start",
		textAlign: "left",
		borderRadius: 1,
		p: 1,
		flexShrink: 0,
		bgcolor: current ? "action.selected" : undefined,
		"&:hover": { bgcolor: current ? "action.selected" : "action.hover" },
	}) as const;

export function HighLevelReviewRailEntry({
	entry,
	current,
	ticks,
	onPick,
}: {
	entry: HighLevelReviewEntry;
	current: boolean;
	ticks: HighLevelTick[];
	onPick: () => void;
}) {
	const { view } = entry;
	return (
		<ButtonBase
			onClick={onPick}
			aria-current={current ? "true" : undefined}
			title={view?.slice.title ?? "Overview"}
			sx={entrySx(current)}
		>
			<HighLevelRailEntryLabel view={view} />
			<Box sx={{ lineHeight: "20px" }}>
				<HighLevelTickDots ticks={ticks} />
			</Box>
			{view && (
				<Box sx={{ gridColumn: "2 / 4" }}>
					<HighLevelLineCounts
						additions={view.slice.additions}
						deletions={view.slice.deletions}
						inline
					/>
				</Box>
			)}
		</ButtonBase>
	);
}
