import { Box } from "@mui/material";
import type { ViewType } from "react-diff-view";
import type {
	HighLevelFileStatus,
	HighLevelForeignHunk,
} from "../../../../../../review/highLevel/types";
import { DiffCommentLayer } from "../../DiffCommentLayer";
import { diffSx } from "../../diffSx";
import { FileDiffBody } from "../../FileDiffBody";
import type { HighLevelDiffComments } from "./HighLevelDiffComments";
import { HighLevelDiffNote } from "./HighLevelDiffNote";
import { diffGapRenderer } from "../../diffGaps/diffGapRenderer";
import { gapSx } from "../../diffGaps/gapSx";
import { useExpandableDiff } from "./HighLevelNativeDiff/useExpandableDiff";

export function HighLevelNativeDiff({
	path,
	status,
	patch,
	truncated,
	viewType,
	comments,
	elsewhere,
}: {
	path: string;
	status: HighLevelFileStatus;
	patch: string | null;
	truncated?: boolean;
	viewType: ViewType;
	comments?: HighLevelDiffComments | undefined;
	elsewhere?: HighLevelForeignHunk[] | undefined;
}) {
	const { file, expansion } = useExpandableDiff(path, status, patch);

	if (!file)
		return (
			<HighLevelDiffNote>
				{truncated
					? "Too large to show here — open it on GitHub."
					: "No diff available — open it on GitHub."}
			</HighLevelDiffNote>
		);

	return (
		<Box sx={[diffSx, gapSx, { pt: 0.5, minWidth: 0 }]}>
			<DiffCommentLayer
				path={path}
				cwd={comments?.cwd}
				hunks={file.hunks}
				onComment={comments?.onComment}
				onQueue={comments?.onQueue}
				unavailable={comments?.unavailable}
			>
				<FileDiffBody
					file={file}
					path={path}
					viewType={viewType}
					renderGap={diffGapRenderer(expansion, elsewhere)}
				/>
			</DiffCommentLayer>
			{truncated && (
				<HighLevelDiffNote>
					Truncated — the rest of this diff is on GitHub.
				</HighLevelDiffNote>
			)}
		</Box>
	);
}
