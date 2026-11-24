import { NextContent } from "./NextView/NextContent";
import { NextHeader } from "./NextView/NextHeader";
import { NextReviewDialog } from "./NextView/NextReviewDialog";
import { useNextActions } from "./NextView/useNextActions";
import { useNextItems } from "./NextView/useNextItems";
import { useNextPageLayout } from "./NextView/useNextPageLayout";
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
	const layout = useNextPageLayout();

	return (
		<PageShell
			{...layout.shell}
			contentLoading={loading && !data}
			header={
				<NextHeader
					cwd={selectedCwd}
					loading={loading}
					data={data}
					onRefresh={refresh}
				/>
			}
			isEmpty={!data}
			emptyMessage={error ?? undefined}
		>
			{data && (
				<NextContent
					data={data}
					actions={actions}
					pickup={pickup}
					spacing={layout.spacing}
					sessions={sessions}
					selectSession={selectSession}
				/>
			)}
			{reviewing && (
				<NextReviewDialog review={reviewing} onClose={closeReview} />
			)}
		</PageShell>
	);
}
