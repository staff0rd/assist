import { sessionTextSize } from "../../sessionTextSize";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import { Box, Button } from "@mui/material";
import type { HighLevelDiffCounts } from "./countHighLevelDiffs";
import { highLevelToolbarButtonSx } from "./highLevelToolbarButtonSx";

function diffs(count: number) {
	return `${count} diff${count === 1 ? "" : "s"}`;
}

function CountBadge({ count }: { count: number }) {
	return (
		<Box
			component="span"
			data-testid="bulk-count"
			sx={{
				ml: 0.75,
				px: 0.5,
				minWidth: 18,
				borderRadius: 1,
				bgcolor: "action.selected",
				fontFamily: "fontFamilyMono",
				fontSize: sessionTextSize(11),
				lineHeight: "16px",
				textAlign: "center",
			}}
		>
			{count}
		</Box>
	);
}

export function HighLevelBulkButtons({
	bulk,
}: {
	bulk: HighLevelDiffCounts & {
		expandAll: () => void;
		collapseAll: () => void;
	};
}) {
	return (
		<>
			<Button
				size="small"
				color="inherit"
				startIcon={<UnfoldMoreIcon />}
				title={`Expand the ${diffs(bulk.collapsed)} collapsed`}
				disabled={bulk.collapsed === 0}
				onClick={bulk.expandAll}
				sx={highLevelToolbarButtonSx}
			>
				Expand all
				<CountBadge count={bulk.collapsed} />
			</Button>
			<Button
				size="small"
				color="inherit"
				startIcon={<UnfoldLessIcon />}
				title={`Collapse the ${diffs(bulk.open)} open`}
				disabled={bulk.open === 0}
				onClick={bulk.collapseAll}
				sx={highLevelToolbarButtonSx}
			>
				Collapse all
				<CountBadge count={bulk.open} />
			</Button>
		</>
	);
}
