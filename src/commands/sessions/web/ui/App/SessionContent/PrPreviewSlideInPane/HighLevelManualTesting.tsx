import { Box, Chip, Typography } from "@mui/material";
import type { HighLevelManualTesting as ManualTesting } from "../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";
import { ManualTestingCommentLayer } from "./HighLevelManualTesting/ManualTestingCommentLayer";
import { ManualTestingSteps } from "./HighLevelManualTesting/ManualTestingSteps";
import { ManualText } from "./HighLevelManualTesting/ManualText";

export function HighLevelManualTesting({
	manualTesting,
	repo,
	headSha,
	comments,
}: {
	manualTesting: ManualTesting | undefined;
	repo: string;
	headSha: string;
	comments?: HighLevelDiffComments | undefined;
}) {
	if (!manualTesting)
		return (
			<Typography variant="body2" sx={{ color: "text.secondary" }}>
				No manual testing steps — re-run with --force
			</Typography>
		);
	if (manualTesting.steps.length === 0)
		return (
			<Typography variant="body2" sx={{ color: "text.secondary" }}>
				Nothing in this PR needs a human to exercise it
			</Typography>
		);
	const text = (value: string) => (
		<ManualText text={value} repo={repo} headSha={headSha} />
	);
	return (
		<ManualTestingCommentLayer
			manualTesting={manualTesting}
			comments={comments}
		>
			<Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
				{manualTesting.setup.length > 0 && (
					<Box
						role="group"
						aria-label="Setup"
						sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}
					>
						{manualTesting.setup.map((item, index) => (
							<Chip
								key={`${index}:${item}`}
								size="small"
								variant="outlined"
								label={text(item)}
							/>
						))}
					</Box>
				)}
				<ManualTestingSteps steps={manualTesting.steps} text={text} />
			</Box>
		</ManualTestingCommentLayer>
	);
}
