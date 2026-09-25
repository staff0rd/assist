import Box from "@mui/material/Box";
import type { ReleaseNodeState } from "../../../../../../../../../../releases/types";
import { formatLocalTimestamp } from "../../../../formatLocalTimestamp";
import { formatRelativeTime } from "../../../../../../../../../formatRelativeTime";
import { ReleaseCommitLink } from "../../../../ReleaseCommitLink";
import { releaseFactLineSx } from "../releaseFactLineSx";
import { ReleaseMark } from "../../../../../ReleaseMark";
import { releaseToneColors } from "../../../../../releaseToneColors";

function liveSince(node: ReleaseNodeState): string {
	const where = `Live in ${node.environment}`;
	if (!node.deployedAt) return where;
	return `${where} since ${formatLocalTimestamp(node.deployedAt)}`;
}

function behindNote(behind: number, branch: string | null): string {
	const commits = behind === 1 ? "commit" : "commits";
	return `${behind} ${commits} on ${branch ?? "the default branch"} this environment has not got yet`;
}

export function ReleaseLiveLine({
	node,
	repo,
	defaultBranch,
}: {
	node: ReleaseNodeState;
	repo: string;
	defaultBranch: string | null;
}) {
	const { live, deployedAt, behind, queued } = node;

	return (
		<Box sx={releaseFactLineSx}>
			{live && (
				<ReleaseCommitLink repo={repo} commit={live} note={liveSince(node)} />
			)}
			{deployedAt && (
				<ReleaseMark title={`Deployed ${formatLocalTimestamp(deployedAt)}`}>
					{formatRelativeTime(deployedAt)}
				</ReleaseMark>
			)}
			{behind !== null && behind > 0 && (
				<ReleaseMark
					title={behindNote(behind, defaultBranch)}
					color={releaseToneColors[queued ? "gate" : "drift"]}
				>
					−{behind}
				</ReleaseMark>
			)}
		</Box>
	);
}
