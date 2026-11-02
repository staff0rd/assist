import { Box, Typography } from "@mui/material";
import type { HighLevelSlice } from "../../../../../../../review/highLevel/types";
import { SliceChip } from "./HighLevelSliceBar/SliceChip";

export function HighLevelSliceBar({
	slices,
	selected,
	onSelect,
}: {
	slices: HighLevelSlice[];
	selected: number | null;
	onSelect: (number: number | null) => void;
}) {
	return (
		<Box
			role="group"
			aria-label="Slices"
			sx={{
				display: "flex",
				flexWrap: "wrap",
				alignItems: "center",
				gap: 0.75,
			}}
		>
			<Typography variant="caption" sx={{ color: "text.secondary" }}>
				Slice
			</Typography>
			<SliceChip
				pressed={selected === null}
				number={slices.length}
				label="All"
				onClick={() => onSelect(null)}
			/>
			{slices.map((slice, index) => (
				<SliceChip
					key={`${index}:${slice.title}`}
					pressed={selected === index + 1}
					muted={slice.rest === true}
					number={index + 1}
					label={slice.title}
					onClick={() => onSelect(index + 1)}
				/>
			))}
		</Box>
	);
}
