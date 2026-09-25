import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import type { ReleaseStreamState } from "../../../../../releases/types";
import { formatLocalTimestamp } from "../formatLocalTimestamp";
import { ReleaseCommitLink } from "../ReleaseCommitLink";

function runNote(run: NonNullable<ReleaseStreamState["run"]>): string {
	const started = run.startedAt
		? ` started ${formatLocalTimestamp(run.startedAt)}`
		: "";
	return `Latest run #${run.number} — ${run.status}${started}`;
}

export function ReleaseStreamLinks({
	stream,
	sx,
}: {
	stream: ReleaseStreamState;
	sx: Record<string, unknown>;
}) {
	const { head, run } = stream;
	if (!head && !run) return null;

	return (
		<Box sx={sx}>
			{head && (
				<ReleaseCommitLink
					repo={stream.repo}
					commit={head}
					note={`Tip of ${stream.defaultBranch ?? "the default branch"}`}
				/>
			)}
			{head && run && " · "}
			{run && (
				<Tooltip title={runNote(run)}>
					<Link href={run.url} target="_blank" rel="noreferrer">
						#{run.number}
					</Link>
				</Tooltip>
			)}
		</Box>
	);
}
