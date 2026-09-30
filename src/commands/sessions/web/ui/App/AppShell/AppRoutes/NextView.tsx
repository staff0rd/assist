import Stack from "@mui/material/Stack";
import { useState } from "react";
import type { NextPr } from "../../../../next/types";
import { NextGroups } from "./NextView/NextGroups";
import { NextHeader } from "./NextView/NextHeader";
import { NextRecommended } from "./NextView/NextRecommended";
import { NextReviewDialog } from "./NextView/NextReviewDialog";
import { useNextItems } from "./NextView/useNextItems";
import { useStartIssue } from "./NextView/useStartIssue";
import { PageShell } from "../../PageShell";
import { useRepoSelectionContext } from "../../../useRepoSelectionContext";

export function NextView() {
	const { selectedCwd } = useRepoSelectionContext();
	const { data, loading, error, refresh } = useNextItems(selectedCwd);
	const [reviewing, setReviewing] = useState<NextPr | null>(null);
	const startIssue = useStartIssue();

	return (
		<PageShell
			loading={loading && !data}
			header={
				<NextHeader loading={loading} peers={data?.peers} onRefresh={refresh} />
			}
			isEmpty={!data}
			emptyMessage={error ?? undefined}
		>
			{data && (
				<Stack spacing={3}>
					<NextRecommended
						data={data}
						onStartPr={setReviewing}
						onStartIssue={startIssue}
					/>
					<NextGroups
						data={data}
						onStartPr={setReviewing}
						onStartIssue={startIssue}
					/>
				</Stack>
			)}
			{reviewing && (
				<NextReviewDialog pr={reviewing} onClose={() => setReviewing(null)} />
			)}
		</PageShell>
	);
}
