import { Box, Chip } from "@mui/material";
import { useMemo } from "react";
import { highLevelTestCount } from "../../../../../../review/highLevel/highLevelTestCount";
import { sliceHighLevelTests } from "../../../../../../review/highLevel/sliceHighLevelTests";
import type {
	HighLevelSlice,
	HighLevelTestFile,
} from "../../../../../../review/highLevel/types";
import { selectHighLevelSlice } from "./selectHighLevelSlice";

export function HighLevelSliceTestLinks({
	slices,
	tests,
}: {
	slices: HighLevelSlice[];
	tests: HighLevelTestFile[];
}) {
	const counts = useMemo(
		() => sliceHighLevelTests(tests, slices).map(highLevelTestCount),
		[tests, slices],
	);
	return (
		<Box
			role="group"
			aria-label="Tests by slice"
			sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
		>
			{slices.map((slice, index) => {
				const count = counts[index] ?? 0;
				return (
					<Chip
						key={`${index}:${slice.title}`}
						size="small"
						variant="outlined"
						clickable
						onClick={() => selectHighLevelSlice(index + 1, true)}
						label={`${index + 1} ${slice.title} · ${count} test${count === 1 ? "" : "s"}`}
					/>
				);
			})}
		</Box>
	);
}
