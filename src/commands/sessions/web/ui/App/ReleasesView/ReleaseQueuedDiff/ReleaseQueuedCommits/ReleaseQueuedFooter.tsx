import Box from "@mui/material/Box";
import type { ReleaseCommit } from "../../../../../releases/types";
import type { ReleaseCompareView } from "../useReleaseCompare";
import { ReleaseQueuedFooterLink } from "./ReleaseQueuedFooter/ReleaseQueuedFooterLink";
import { sessionTextSize } from "../../../sessionTextSize";

const footSx = {
	display: "flex",
	flexWrap: "wrap",
	alignItems: "baseline",
	gap: 1.5,
	px: 1.5,
	py: 1,
	borderTop: 1,
	borderColor: "divider",
	fontSize: sessionTextSize(12.5),
	color: "text.secondary",
} as const;

export function ReleaseQueuedFooter({
	repo,
	live,
	queued,
	runUrl,
	view,
}: {
	repo: string;
	live: ReleaseCommit | null;
	queued: ReleaseCommit;
	runUrl: string | null;
	view: ReleaseCompareView;
}) {
	const capped =
		view.status === "loaded" && view.compare.changes.length < view.compare.total
			? view.compare
			: null;
	if (!capped && !live && !runUrl) return null;

	return (
		<Box sx={footSx}>
			{capped && (
				<span>
					Showing {capped.changes.length} of {capped.total}
				</span>
			)}
			{live && (
				<ReleaseQueuedFooterLink
					href={`https://github.com/${repo}/compare/${live.sha}...${queued.sha}`}
				>
					Compare on GitHub
				</ReleaseQueuedFooterLink>
			)}
			{runUrl && (
				<ReleaseQueuedFooterLink href={runUrl}>
					Review deployment
				</ReleaseQueuedFooterLink>
			)}
		</Box>
	);
}
