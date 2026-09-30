import Stack from "@mui/material/Stack";
import { useState } from "react";
import { NextGroups } from "./NextView/NextGroups";
import { NextHeader } from "./NextView/NextHeader";
import { NextRecommended } from "./NextView/NextRecommended";
import { type NextReview, NextReviewDialog } from "./NextView/NextReviewDialog";
import { useCloneLookup } from "./NextView/useCloneLookup";
import { NextCloneContext } from "./NextView/useNextClone";
import { useNextItems } from "./NextView/useNextItems";
import { useStartIssue } from "./NextView/useStartIssue";
import { PageShell } from "../../PageShell";
import { useRepoSelectionContext } from "../../../useRepoSelectionContext";

export function NextView() {
	const { selectedCwd } = useRepoSelectionContext();
	const { data, loading, error, refresh } = useNextItems(selectedCwd);
	const [reviewing, setReviewing] = useState<NextReview | null>(null);
	const startIssue = useStartIssue();
	const cloneFor = useCloneLookup(data?.scope.selfRepo ?? null);
	const startPr = (pr: NextReview["pr"], cwd: string) =>
		setReviewing({ pr, cwd });

	return (
		<PageShell
			loading={loading && !data}
			header={
				<NextHeader loading={loading} scope={data?.scope} onRefresh={refresh} />
			}
			isEmpty={!data}
			emptyMessage={error ?? undefined}
		>
			{data && (
				<NextCloneContext.Provider value={cloneFor}>
					<Stack spacing={3}>
						<NextRecommended
							data={data}
							onStartPr={startPr}
							onStartIssue={startIssue}
						/>
						<NextGroups
							data={data}
							onStartPr={startPr}
							onStartIssue={startIssue}
						/>
					</Stack>
				</NextCloneContext.Provider>
			)}
			{reviewing && (
				<NextReviewDialog
					review={reviewing}
					onClose={() => setReviewing(null)}
				/>
			)}
		</PageShell>
	);
}
