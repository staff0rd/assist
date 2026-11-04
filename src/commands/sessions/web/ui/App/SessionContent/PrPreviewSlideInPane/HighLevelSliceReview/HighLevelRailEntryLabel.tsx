import { Typography } from "@mui/material";
import type { HighLevelSliceView } from "./highLevelSliceViews";

export function HighLevelRailEntryLabel({
	view,
}: {
	view: HighLevelSliceView | undefined;
}) {
	const rest = view?.slice.rest === true;
	return (
		<>
			<Typography
				component="span"
				variant="caption"
				sx={{
					fontFamily: "fontFamilyMono",
					fontWeight: 600,
					color: "text.secondary",
					lineHeight: "20px",
				}}
			>
				{view ? view.number : "◎"}
			</Typography>
			<Typography
				component="span"
				variant="body2"
				sx={{
					fontWeight: rest ? 400 : 500,
					color: rest ? "text.secondary" : undefined,
					minWidth: 0,
					overflowWrap: "anywhere",
				}}
			>
				{view?.slice.title ?? "Overview"}
			</Typography>
		</>
	);
}
