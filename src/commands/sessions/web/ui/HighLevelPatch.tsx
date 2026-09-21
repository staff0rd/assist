import { Box } from "@mui/material";
import { highLevelPatchLines } from "./highLevelPatchLines";
import { highLevelPatchLineSx } from "./highLevelPatchLineSx";

export function HighLevelPatch({ patch }: { patch: string }) {
	return (
		<Box
			component="pre"
			sx={{ m: 0, py: 0.5, overflowX: "auto", bgcolor: "action.hover" }}
		>
			{highLevelPatchLines(patch).map((line) => (
				<Box
					component="span"
					key={line.id}
					sx={highLevelPatchLineSx(line.text)}
				>
					{line.text === "" ? " " : line.text}
				</Box>
			))}
		</Box>
	);
}
