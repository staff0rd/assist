import { Box, Link, Typography } from "@mui/material";
import type { HighLevelCriticalDiff } from "../../../review/highLevel/types";
import { HighLevelLineCounts } from "./HighLevelLineCounts";
import { HighLevelPatch } from "./HighLevelPatch";
import {
	HIGH_LEVEL_STATUS_COLOURS,
	highLevelTreeNameSx,
} from "./highLevelTreeRowSx";

function Note({ children }: { children: string }) {
	return (
		<Typography variant="caption" sx={{ color: "text.secondary" }}>
			{children}
		</Typography>
	);
}

function DiffHeader({ diff }: { diff: HighLevelCriticalDiff }) {
	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
			<Link
				href={diff.diffUrl}
				target="_blank"
				rel="noreferrer"
				sx={{ ...highLevelTreeNameSx, fontWeight: 600 }}
				title={diff.path}
			>
				{diff.path}
			</Link>
			<Typography
				variant="caption"
				sx={{ flexShrink: 0 }}
				color={HIGH_LEVEL_STATUS_COLOURS[diff.status]}
			>
				{diff.status}
			</Typography>
			<HighLevelLineCounts
				additions={diff.additions}
				deletions={diff.deletions}
			/>
		</Box>
	);
}

export function HighLevelCriticalDiffs({
	diffs,
	criticalPaths,
}: {
	diffs: HighLevelCriticalDiff[];
	criticalPaths: string[];
}) {
	if (criticalPaths.length === 0)
		return (
			<Note>
				review.highLevel.criticalPaths is unset, so no diffs are shown here.
			</Note>
		);
	if (diffs.length === 0)
		return (
			<Note>{`No changed file matches ${criticalPaths.join(", ")}.`}</Note>
		);
	return (
		<Box sx={{ minWidth: 0 }}>
			{diffs.map((diff) => (
				<Box key={diff.path} sx={{ mb: 1 }}>
					<DiffHeader diff={diff} />
					{diff.patch === null ? (
						<Note>No diff available; open the file on GitHub.</Note>
					) : (
						<HighLevelPatch patch={diff.patch} />
					)}
				</Box>
			))}
		</Box>
	);
}
