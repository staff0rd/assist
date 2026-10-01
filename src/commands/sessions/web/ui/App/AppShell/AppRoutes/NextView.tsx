import Stack from "@mui/material/Stack";
import { NextGroups } from "./NextView/NextGroups";
import { NextHeader } from "./NextView/NextHeader";
import { NextPickupStatus } from "./NextView/NextPickupStatus";
import { NextRecommended } from "./NextView/NextRecommended";
import { NextReviewDialog } from "./NextView/NextReviewDialog";
import { useCloneLookup } from "./NextView/useCloneLookup";
import { useNextActions } from "./NextView/useNextActions";
import { NextCloneContext } from "./NextView/useNextClone";
import { useNextItems } from "./NextView/useNextItems";
import { NextSessionsContext } from "./NextView/useNextSessions";
import { useNextSessionsValue } from "./NextView/useNextSessionsValue";
import { PageShell } from "../../PageShell";
import type { SessionInfo } from "../../../types";
import { useRepoSelectionContext } from "../../../useRepoSelectionContext";

export function NextView({
	sessions,
	selectSession,
}: {
	sessions: SessionInfo[];
	selectSession: (id: string) => void;
}) {
	const { selectedCwd } = useRepoSelectionContext();
	const { data, loading, error, refresh } = useNextItems(selectedCwd);
	const { actions, pickup, reviewing, closeReview } = useNextActions(
		selectedCwd,
		refresh,
	);
	const cloneFor = useCloneLookup(data?.scope.selfRepo ?? null);
	const nextSessions = useNextSessionsValue(sessions, selectSession);

	return (
		<PageShell
			loading={loading && !data}
			header={<NextHeader loading={loading} data={data} onRefresh={refresh} />}
			isEmpty={!data}
			emptyMessage={error ?? undefined}
		>
			{data && (
				<NextCloneContext.Provider value={cloneFor}>
					<NextSessionsContext.Provider value={nextSessions}>
						<Stack spacing={3}>
							<NextPickupStatus {...pickup} />
							<NextRecommended data={data} {...actions} />
							<NextGroups data={data} {...actions} />
						</Stack>
					</NextSessionsContext.Provider>
				</NextCloneContext.Provider>
			)}
			{reviewing && (
				<NextReviewDialog review={reviewing} onClose={closeReview} />
			)}
		</PageShell>
	);
}
