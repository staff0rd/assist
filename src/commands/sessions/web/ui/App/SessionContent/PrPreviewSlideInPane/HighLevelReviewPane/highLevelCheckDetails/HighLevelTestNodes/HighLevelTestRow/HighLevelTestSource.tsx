import { Box } from "@mui/material";
import type { HighLevelTestCase } from "../../../../../../../../../../review/highLevel/types";
import { syntaxTokenSx } from "../../../../../../syntaxTokenSx";
import { HighLevelDiffNote } from "../../HighLevelDiffNote";
import { useHighlightedSource } from "./HighLevelTestSource/useHighlightedSource";

export function HighLevelTestSource({
	test,
	path,
	indent,
}: {
	test: HighLevelTestCase;
	path: string;
	indent: string;
}) {
	const { source } = test;
	const highlighted = useHighlightedSource(source, path);

	if (source === undefined)
		return (
			<Box sx={{ pl: `calc(${indent} + 20px)` }}>
				<HighLevelDiffNote>
					{test.truncated
						? "Too long to show here — open the file on GitHub."
						: "No source available."}
				</HighLevelDiffNote>
			</Box>
		);
	return (
		<Box
			component="pre"
			sx={[
				syntaxTokenSx,
				{
					m: 0,
					my: 0.5,
					ml: `calc(${indent} + 20px)`,
					p: 1,
					fontSize: 12,
					fontFamily: "monospace",
					tabSize: 2,
					overflowX: "auto",
					borderRadius: 1,
					bgcolor: "action.hover",
				},
			]}
		>
			{highlighted}
		</Box>
	);
}
