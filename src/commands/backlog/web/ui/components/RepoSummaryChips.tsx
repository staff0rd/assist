import { Stack } from "@mui/material";
import { useRepoSelectionContext } from "../../../../sessions/web/ui/useRepoSelectionContext";
import type { SessionInfo } from "../../../../sessions/web/ui/useSessionSocket";
import { useRepoSummaries } from "../useRepoSummaries";
import { CloneConfirmation } from "./CloneConfirmation";
import { RepoChip } from "./RepoChip";
import { useCloneOnSelect } from "./useCloneOnSelect";

const stackSx = { flexWrap: "wrap", gap: 1, mb: 2 } as const;

export function RepoSummaryChips({ sessions }: { sessions: SessionInfo[] }) {
	const { summaries, node } = useRepoSummaries();
	const { setSelectedCwd } = useRepoSelectionContext();
	const clone = useCloneOnSelect(sessions);
	if (summaries.length === 0) return null;

	return (
		<Stack direction="row" sx={stackSx}>
			{summaries.map((summary) => (
				<RepoChip
					key={summary.origin}
					summary={summary}
					node={node}
					onSelectCwd={(cwd) =>
						node ? setSelectedCwd(cwd, node) : setSelectedCwd(cwd)
					}
					onRequestClone={clone.requestClone}
				/>
			))}
			<CloneConfirmation clone={clone} />
		</Stack>
	);
}
