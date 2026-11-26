import { Typography } from "@mui/material";
import type { HighLevelTestSuite } from "../../../../../../../../review/highLevel/types";
import { HighLevelTestKeyword } from "./HighLevelTestKeyword";
import { highLevelTestNameSx } from "./highLevelTestNameSx";

const WHEN = /^(when)(\s.*)$/is;

export function HighLevelTestSuiteName({
	suite,
	indent,
}: {
	suite: HighLevelTestSuite;
	indent: string;
}) {
	const when = suite.ungrouped ? null : WHEN.exec(suite.name);
	return (
		<Typography
			component="div"
			sx={{
				...highLevelTestNameSx,
				pl: indent,
				py: 0.15,
				fontWeight: 600,
				...(suite.ungrouped
					? { color: "text.secondary", fontStyle: "italic" }
					: {}),
			}}
			title={suite.name}
		>
			{when ? (
				<>
					<HighLevelTestKeyword word={when[1] ?? ""} />
					{when[2]}
				</>
			) : (
				suite.name
			)}
		</Typography>
	);
}
