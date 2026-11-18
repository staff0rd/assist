import Box from "@mui/material/Box";
import type { ReleaseCommit } from "../../../../../releases/types";
import type { ReleaseCompareView } from "../useReleaseCompare";
import { sessionTextSize } from "../../../sessionTextSize";

const SHORT_SHA = 7;

const headSx = {
	display: "flex",
	alignItems: "baseline",
	justifyContent: "space-between",
	gap: 1.5,
	px: 1.5,
	py: 1,
	borderBottom: 1,
	borderColor: "divider",
} as const;

const titleSx = { fontWeight: 500, fontSize: sessionTextSize(13.5) } as const;

const rangeSx = {
	fontFamily: "fontFamilyMono",
	fontSize: sessionTextSize(12),
	color: "text.secondary",
	whiteSpace: "nowrap",
} as const;

function short(sha: string): string {
	return sha.slice(0, SHORT_SHA);
}

function title(view: ReleaseCompareView, environment: string | null): string {
	if (view.status !== "loaded") return `Changes queued for ${environment}`;
	const { total, changes } = view.compare;
	const allPrs = changes.every((change) => change.pr);
	const noun = allPrs ? "PR" : "change";
	return `${total} ${noun}${total === 1 ? "" : "s"} queued for ${environment}`;
}

export function ReleaseQueuedHeader({
	environment,
	live,
	queued,
	view,
}: {
	environment: string | null;
	live: ReleaseCommit | null;
	queued: ReleaseCommit;
	view: ReleaseCompareView;
}) {
	return (
		<Box sx={headSx}>
			<Box component="strong" sx={titleSx}>
				{title(view, environment)}
			</Box>
			<Box component="span" sx={rangeSx}>
				{live ? `${short(live.sha)} → ${short(queued.sha)}` : short(queued.sha)}
			</Box>
		</Box>
	);
}
