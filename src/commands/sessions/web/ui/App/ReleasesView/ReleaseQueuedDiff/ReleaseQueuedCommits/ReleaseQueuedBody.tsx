import Box from "@mui/material/Box";
import type { ReleaseCommit } from "../../../../../releases/types";
import { ReleaseQueuedCommitRow } from "./ReleaseQueuedBody/ReleaseQueuedCommitRow";
import { ReleaseQueuedSkeleton } from "./ReleaseQueuedBody/ReleaseQueuedSkeleton";
import type { ReleaseCompareView } from "../useReleaseCompare";
import { sessionTextSize } from "../../../sessionTextSize";

const errorSx = {
	px: 1.5,
	py: 2,
	fontSize: sessionTextSize(13),
	lineHeight: 1.5,
	color: "error.main",
} as const;

const listSx = {
	listStyle: "none",
	m: 0,
	py: 0.5,
	px: 0,
	maxHeight: 296,
	overflowY: "auto",
} as const;

export function ReleaseQueuedBody({
	repo,
	live,
	view,
}: {
	repo: string;
	live: ReleaseCommit | null;
	view: ReleaseCompareView;
}) {
	if (view.status === "loading") return <ReleaseQueuedSkeleton />;
	if (view.status === "error")
		return (
			<Box sx={errorSx}>
				Couldn't load the commit range from GitHub. Check{" "}
				<code>gh auth status</code>, then try again.
			</Box>
		);
	const { total, changes } = view.compare;
	return (
		<Box component="ol" sx={listSx}>
			{changes.map((change) => (
				<ReleaseQueuedCommitRow key={change.sha} repo={repo} change={change} />
			))}
			{live && changes.length >= total && (
				<ReleaseQueuedCommitRow
					repo={repo}
					change={{ ...live, date: null, pr: null }}
					live
				/>
			)}
		</Box>
	);
}
