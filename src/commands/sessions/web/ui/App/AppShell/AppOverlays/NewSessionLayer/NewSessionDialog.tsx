import { useSessionHarness } from "./NewSessionDialog/useSessionHarness";
import type { NewSessionLaunchers } from "./launchNewSession";
import { NewSessionFields } from "./NewSessionDialog/NewSessionFields";
import { DraftFooter } from "./NewSessionDialog/DraftFooter";
import { useDraftFocus } from "./NewSessionDialog/useDraftFocus";
import { useDraftRepos } from "./NewSessionDialog/useDraftRepos";
import { useDraftSubmit } from "./NewSessionDialog/useDraftSubmit";
import { LoadingFieldset } from "./NewSessionDialog/LoadingFieldset";
import { NewSessionModeError } from "./NewSessionModeError";
import type { NewSessionDraft } from "./useNewSessionDraft";
import { NewSessionDialogFrame } from "./NewSessionDialog/NewSessionDialogFrame";

export function NewSessionDialog({
	draft,
	launchers,
	onClose,
}: {
	draft: NewSessionDraft;
	launchers: NewSessionLaunchers;
	onClose: () => void;
}) {
	const focus = useDraftFocus(draft.focus, draft.setFocus);
	const { harness, harnesses } = useSessionHarness(
		draft.node,
		draft.harness,
		draft.mode,
	);
	const { target, cloneState } = useDraftRepos(draft.node, draft.cwd);

	const { onSubmit, onSubmitClick } = useDraftSubmit(
		draft,
		harness,
		target,
		launchers,
		onClose,
	);

	return (
		<NewSessionDialogFrame
			onClose={onClose}
			onEntered={focus.restore}
			onSubmit={onSubmit}
		>
			<LoadingFieldset loading={draft.modePending} restoreFocus={focus.restore}>
				<NewSessionFields
					draft={draft}
					harness={harness}
					harnesses={harnesses}
					focus={focus}
					cloneState={cloneState}
				/>
				<NewSessionModeError
					error={draft.modeError}
					onRetry={draft.retryMode}
				/>
				<DraftFooter
					draft={draft}
					targetKind={target.kind}
					onClick={onSubmitClick}
				/>
			</LoadingFieldset>
		</NewSessionDialogFrame>
	);
}
