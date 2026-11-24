import { Box } from "@mui/material";
import { useRef } from "react";
import type { HighLevelPreviewPayload } from "../../../../../../../review/highLevel/types";
import type { HighLevelDiffComments } from "../HighLevelDiffComments";
import type { useHighLevelChecklist } from "../HighLevelReviewPane/useHighLevelChecklist";
import { HighLevelAreaPanel } from "./HighLevelAreaPanel";
import { HighLevelAreaTabs } from "./HighLevelAreaTabs";
import { HighLevelEntryHeader } from "./HighLevelEntryHeader";
import { useHighLevelReviewScroll } from "./HighLevelReviewMain/useHighLevelReviewScroll";
import type { useHighLevelReviewNav } from "./useHighLevelReviewNav";

export function HighLevelReviewMain({
	payload,
	nav,
	checklist,
	comments,
}: {
	payload: HighLevelPreviewPayload;
	nav: ReturnType<typeof useHighLevelReviewNav>;
	checklist: ReturnType<typeof useHighLevelChecklist>;
	comments?: HighLevelDiffComments | undefined;
}) {
	const mainRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	useHighLevelReviewScroll(mainRef, contentRef, nav);
	const { entry, area } = nav;

	return (
		<Box
			ref={mainRef}
			sx={{ minWidth: 0, minHeight: 0, overflowY: "auto", pb: 2 }}
		>
			<Box ref={contentRef}>
				{entry && (
					<>
						<HighLevelEntryHeader
							entry={entry}
							structure={payload.structure}
							sliceCount={payload.slices?.length ?? 0}
						/>
						<HighLevelAreaTabs
							entry={entry}
							area={area}
							ticked={checklist.ticked}
							onPick={nav.pickArea}
						/>
						{area && (
							<HighLevelAreaPanel
								entry={entry}
								area={area}
								payload={payload}
								checklist={checklist}
								comments={comments}
							/>
						)}
					</>
				)}
			</Box>
		</Box>
	);
}
