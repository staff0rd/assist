import { Box, Typography } from "@mui/material";
import { highLevelEntryTicks } from "./highLevelEntryTicks";
import type { HighLevelReviewEntry } from "./highLevelReviewEntries";
import { HighLevelReviewRailEntry } from "./HighLevelReviewRailEntry";
import { highLevelNarrow } from "./highLevelNarrow";

const railSx = {
	borderRight: 1,
	borderColor: "divider",
	p: 1,
	display: "flex",
	flexDirection: "column",
	gap: 0.25,
	overflowY: "auto",
	minHeight: 0,
	[highLevelNarrow]: {
		borderRight: 0,
		borderBottom: 1,
		flexDirection: "row",
		overflowX: "auto",
		overflowY: "visible",
		"& > button": { minWidth: 190 },
		"& > .rail-label": { display: "none" },
	},
} as const;

export function HighLevelReviewRail({
	entries,
	current,
	ticked,
	onPick,
}: {
	entries: HighLevelReviewEntry[];
	current: number;
	ticked: (key: string) => boolean;
	onPick: (index: number) => void;
}) {
	return (
		<Box component="nav" aria-label="Slices" sx={railSx}>
			<Typography
				className="rail-label"
				variant="overline"
				sx={{ px: 1, color: "text.disabled", letterSpacing: 1 }}
			>
				Review
			</Typography>
			{entries.map((entry, index) => (
				<HighLevelReviewRailEntry
					key={entry.view ? `${index}:${entry.view.slice.title}` : "overview"}
					entry={entry}
					current={index === current}
					ticks={highLevelEntryTicks(entry, ticked)}
					onPick={() => onPick(index)}
				/>
			))}
		</Box>
	);
}
