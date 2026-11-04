import { Box } from "@mui/material";
import type { HighLevelSliceRef } from "../../../../../../../../../../review/highLevel/types";
import { selectHighLevelSlice } from "../../../../selectHighLevelSlice";
import { HighLevelTreeTag } from "../../HighLevelTreeTag";

export function HighLevelTreeSliceTags({
	slices,
}: {
	slices: HighLevelSliceRef[] | undefined;
}) {
	if (!slices || slices.length === 0) return null;
	return (
		<Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
			{slices.map(({ number, title }) => (
				<HighLevelTreeTag
					key={number}
					label={`slice ${number}`}
					title={`Show slice ${number}: ${title}`}
					onClick={() => selectHighLevelSlice(number)}
				/>
			))}
		</Box>
	);
}
