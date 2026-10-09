import { Box } from "@mui/material";
import { useMemo } from "react";
import { parseDiff, type ViewType } from "react-diff-view";
import type { HighLevelFileStatus } from "../../../../../../../../../review/highLevel/types";
import { DiffCommentLayer } from "../../../../../DiffCommentLayer";
import { diffSx } from "../../../../../diffSx";
import { FileDiffBody } from "../../../../../FileDiffBody";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import { HighLevelDiffNote } from "./HighLevelDiffNote";
import { highLevelUnifiedDiff } from "./HighLevelNativeDiff/highLevelUnifiedDiff";

export function HighLevelNativeDiff({
	path,
	status,
	patch,
	truncated,
	viewType,
	comments,
}: {
	path: string;
	status: HighLevelFileStatus;
	patch: string | null;
	truncated?: boolean;
	viewType: ViewType;
	comments?: HighLevelDiffComments | undefined;
}) {
	const file = useMemo(() => {
		if (!patch) return undefined;
		try {
			return parseDiff(highLevelUnifiedDiff(path, status, patch))[0];
		} catch {
			return undefined;
		}
	}, [path, status, patch]);

	if (!file)
		return (
			<HighLevelDiffNote>
				{truncated
					? "Too large to show here — open it on GitHub."
					: "No diff available — open it on GitHub."}
			</HighLevelDiffNote>
		);

	return (
		<Box sx={[diffSx, { pt: 0.5, minWidth: 0 }]}>
			<DiffCommentLayer
				path={path}
				cwd={comments?.cwd}
				hunks={file.hunks}
				onComment={comments?.onComment}
				unavailable={comments?.unavailable}
			>
				<FileDiffBody file={file} path={path} viewType={viewType} />
			</DiffCommentLayer>
			{truncated && (
				<HighLevelDiffNote>
					Truncated — the rest of this diff is on GitHub.
				</HighLevelDiffNote>
			)}
		</Box>
	);
}
