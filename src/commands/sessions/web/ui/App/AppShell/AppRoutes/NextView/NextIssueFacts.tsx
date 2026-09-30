import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextIssue } from "../../../../../next/types";
import { formatRelativeTime } from "../../../../formatRelativeTime";

export function NextIssueFacts({ issue }: { issue: NextIssue }) {
	return (
		<Stack
			direction="row"
			spacing={1.5}
			useFlexGap
			sx={{ flexWrap: "wrap", color: "text.secondary" }}
		>
			<Typography variant="body2">{issue.author}</Typography>
			<Typography variant="body2">
				opened {formatRelativeTime(issue.createdAt)}
			</Typography>
			{issue.labels.length > 0 && (
				<Typography variant="body2">{issue.labels.join(", ")}</Typography>
			)}
		</Stack>
	);
}
