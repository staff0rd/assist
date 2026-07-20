import { Alert, Snackbar, Stack } from "@mui/material";
import { useRepoSelectionContext } from "../../../../sessions/web/ui/useRepoSelectionContext";
import type { SessionInfo } from "../../../../sessions/web/ui/useSessionSocket";
import { useRepoSummaries } from "../useRepoSummaries";
import { ConfirmDialog } from "./ConfirmDialog";
import { RepoChip } from "./RepoChip";
import { useCloneOnSelect } from "./useCloneOnSelect";

const stackSx = { flexWrap: "wrap", gap: 1, mb: 2 } as const;
const snackbarAnchor = { vertical: "bottom", horizontal: "center" } as const;

export function RepoSummaryChips({ sessions }: { sessions: SessionInfo[] }) {
	const summaries = useRepoSummaries();
	const { setSelectedCwd } = useRepoSelectionContext();
	const { prompt, requestClone, confirm, cancel, error, dismissError } =
		useCloneOnSelect(sessions);
	if (summaries.length === 0) return null;

	return (
		<Stack direction="row" sx={stackSx}>
			{summaries.map((summary) => (
				<RepoChip
					key={summary.origin}
					summary={summary}
					onSelectCwd={setSelectedCwd}
					onRequestClone={requestClone}
				/>
			))}
			{prompt && (
				<ConfirmDialog
					title="Clone repository"
					message={`Clone ${prompt.displayName} over SSH into ${prompt.cloneTarget}?`}
					confirmLabel="Clone"
					confirmColor="primary"
					onConfirm={confirm}
					onCancel={cancel}
				/>
			)}
			<Snackbar
				open={!!error}
				autoHideDuration={8000}
				onClose={dismissError}
				anchorOrigin={snackbarAnchor}
			>
				<Alert severity="error" onClose={dismissError} variant="filled">
					{error}
				</Alert>
			</Snackbar>
		</Stack>
	);
}
