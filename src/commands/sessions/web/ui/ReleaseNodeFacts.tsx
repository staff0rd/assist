import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Tooltip from "@mui/material/Tooltip";
import type { ReleaseEnvironmentState } from "../releases/types";
import { formatLocalTimestamp } from "./formatLocalTimestamp";
import { formatRelativeTime } from "./formatRelativeTime";
import { ReleaseMark } from "./ReleaseMark";
import { releaseToneColors } from "./releaseNodeState";

const lineSx = {
	display: "flex",
	alignItems: "baseline",
	flexWrap: "wrap",
	gap: 1,
	fontFamily: "monospace",
	fontSize: 11,
	color: "text.secondary",
} as const;

function liveSince(environment: ReleaseEnvironmentState): string {
	const where = `Live in ${environment.environment}`;
	if (!environment.deployedAt) return where;
	return `${where} since ${formatLocalTimestamp(environment.deployedAt)}`;
}

export function ReleaseNodeFacts({
	environment,
	repo,
	defaultBranch,
}: {
	environment: ReleaseEnvironmentState;
	repo: string;
	defaultBranch: string | null;
}) {
	const { sha, deployedAt, behind } = environment;

	return (
		<Box sx={lineSx}>
			{sha && (
				<Tooltip title={liveSince(environment)}>
					<Link
						href={`https://github.com/${repo}/commit/${sha}`}
						target="_blank"
						rel="noreferrer"
					>
						{sha.slice(0, 7)}
					</Link>
				</Tooltip>
			)}
			{deployedAt && (
				<ReleaseMark title={`Deployed ${formatLocalTimestamp(deployedAt)}`}>
					{formatRelativeTime(deployedAt)}
				</ReleaseMark>
			)}
			{behind !== null && behind > 0 && (
				<ReleaseMark
					title={`${behind} ${behind === 1 ? "commit" : "commits"} behind ${defaultBranch ?? "the default branch"}`}
					color={releaseToneColors.drift}
				>
					−{behind}
				</ReleaseMark>
			)}
		</Box>
	);
}
