import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { NextChecks, NextPr } from "../../../../../next/types";
import { formatRelativeTime } from "../../../../formatRelativeTime";

const CHECK_LABELS: Record<NextChecks, { label: string; color: string }> = {
	success: { label: "checks passing", color: "success.main" },
	failure: { label: "checks failing", color: "error.main" },
	pending: { label: "checks running", color: "warning.main" },
};

export function NextPrFacts({ pr }: { pr: NextPr }) {
	const checks = pr.checks ? CHECK_LABELS[pr.checks] : null;
	const age =
		pr.reason === "requested"
			? `review requested ${formatRelativeTime(pr.requestedAt)}`
			: `opened ${formatRelativeTime(pr.createdAt)}`;
	return (
		<Stack
			direction="row"
			spacing={1.5}
			useFlexGap
			sx={{ flexWrap: "wrap", color: "text.secondary" }}
		>
			<Typography variant="body2">{pr.author}</Typography>
			<Typography variant="body2">{age}</Typography>
			{checks && (
				<Typography variant="body2" sx={{ color: checks.color }}>
					{checks.label}
				</Typography>
			)}
		</Stack>
	);
}
