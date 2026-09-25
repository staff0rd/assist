import { CommentSentSnackbar } from "./CommentSentSnackbar";
import { ErrorSnackbar } from "../ErrorSnackbar";
import { FileViewBody } from "./FileView/FileViewBody";
import { FileViewHeader } from "./FileView/FileViewHeader";
import { fileViewMessage } from "./FileView/fileViewMessage";
import { PageShell } from "./PageShell";
import type { SessionInfo } from "../../../types";
import { UnsavedChangesPrompt } from "./FileView/UnsavedChangesPrompt";
import { useFileViewState } from "./FileView/useFileViewState";

export function FileView({
	sessions,
	sendInput,
	cardId,
}: {
	sessions: SessionInfo[];
	sendInput: (sessionId: string, data: string) => void;
	cardId: string | null;
}) {
	const { path, cwd, state, buffer, comments, isMarkdown, mode, setMode } =
		useFileViewState(sessions, cardId, sendInput);

	return (
		<PageShell
			loading={state.status === "loading" && Boolean(cwd && path)}
			isEmpty={state.status !== "ready"}
			emptyMessage={fileViewMessage(state.status, path, cwd)}
			maxWidth={false}
		>
			<FileViewHeader
				path={path}
				mode={isMarkdown ? mode : undefined}
				onModeChange={setMode}
				onSave={buffer.save}
				saving={buffer.saving}
				dirty={buffer.dirty}
			/>
			{state.status === "ready" && (
				<FileViewBody
					path={path}
					cwd={cwd}
					rendered={isMarkdown && mode === "rendered"}
					value={buffer.value}
					onChange={buffer.setValue}
					comments={comments}
				/>
			)}
			<UnsavedChangesPrompt dirty={buffer.dirty} />
			<ErrorSnackbar error={buffer.error} onClose={buffer.clearError} />
			<CommentSentSnackbar
				sessionName={comments.sentTo}
				onClose={comments.clearSent}
			/>
		</PageShell>
	);
}
