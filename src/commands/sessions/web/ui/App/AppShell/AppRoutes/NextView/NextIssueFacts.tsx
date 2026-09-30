import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextIssue, NextPickup } from "../../../../../next/types";
import { formatRelativeTime } from "../../../../formatRelativeTime";
import { NextTypeChip } from "./NextIssueFacts/NextTypeChip";

export function NextIssueFacts({ issue }: { issue: NextIssue | NextPickup }) {
	const pickup = "status" in issue ? issue : null;
	return (
		<Stack
			direction="row"
			spacing={1.5}
			useFlexGap
			sx={{ flexWrap: "wrap", color: "text.secondary", alignItems: "center" }}
		>
			{pickup?.type && <NextTypeChip type={pickup.type} />}
			{pickup && (
				<Typography variant="body2">
					{pickup.projectTitle} · {pickup.status}
				</Typography>
			)}
			{pickup?.priority && (
				<Typography variant="body2">{pickup.priority}</Typography>
			)}
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
