import { Box, Typography } from "@mui/material";
import type { HighLevelTestCase } from "../../../../../../../../../../review/highLevel/types";

export function HighLevelTestWrittenName({
	test,
}: {
	test: HighLevelTestCase;
}) {
	if (test.writtenName === undefined) return null;
	return (
		<Typography
			variant="caption"
			component="div"
			sx={{ color: "text.secondary", py: 0.25 }}
		>
			As written:{" "}
			<Box
				component="code"
				sx={{ fontFamily: "fontFamilyMono", color: "text.primary" }}
			>
				{test.writtenName}
			</Box>{" "}
			· line {test.line}
		</Typography>
	);
}
