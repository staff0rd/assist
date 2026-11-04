import { Box } from "@mui/material";
import { JUMP_STRIP_HEIGHT } from "../highLevelCheckDomId";
import { type HighLevelArea, highLevelAreaLabels } from "./highLevelAreaCheck";
import { HighLevelAreaTab } from "./HighLevelAreaTab";
import { highLevelAreaKey } from "./highLevelEntryTicks";
import type { HighLevelReviewEntry } from "./highLevelReviewEntries";

const tabsSx = {
	position: "sticky",
	top: 0,
	zIndex: 4,
	flexShrink: 0,
	display: "flex",
	alignItems: "stretch",
	height: JUMP_STRIP_HEIGHT,
	px: 1.5,
	mt: 1,
	overflowX: "auto",
	scrollbarWidth: "none",
	"&::-webkit-scrollbar": { display: "none" },
	bgcolor: "background.paper",
	borderBottom: 1,
	borderColor: "divider",
} as const;

export function HighLevelAreaTabs({
	entry,
	area,
	ticked,
	onPick,
}: {
	entry: HighLevelReviewEntry;
	area: HighLevelArea | undefined;
	ticked: (key: string) => boolean;
	onPick: (area: HighLevelArea) => void;
}) {
	return (
		<Box role="tablist" aria-label="Areas" sx={tabsSx}>
			{entry.areas.map((candidate) => {
				const key = highLevelAreaKey(entry, candidate);
				return (
					<HighLevelAreaTab
						key={candidate}
						label={highLevelAreaLabels[candidate]}
						count={entry.counts[candidate]}
						tick={key === undefined ? undefined : ticked(key)}
						selected={candidate === area}
						disabled={entry.disabled.has(candidate)}
						onSelect={() => onPick(candidate)}
					/>
				);
			})}
		</Box>
	);
}
