import { harnessChoices } from "./NewSessionDialog/harnessChoices";
import type { NewSessionLaunchers } from "./launchNewSession";
import { NewSessionFields } from "./NewSessionDialog/NewSessionFields";
import { NewSessionFooter } from "./NewSessionDialog/NewSessionFooter";
import { newSessionModes } from "./newSessionModes";
import { useDraftFocus } from "./NewSessionDialog/useDraftFocus";
import { useDraftRepos } from "./NewSessionDialog/useDraftRepos";
import { useDraftSubmit } from "./NewSessionDialog/useDraftSubmit";
import { LoadingFieldset } from "./NewSessionDialog/LoadingFieldset";
import { NewSessionModeError } from "./NewSessionModeError";
import type { NewSessionDraft } from "./useNewSessionDraft";
import { AutoFocusDialog } from "../AutoFocusDialog";
import { useHarnessCapabilities } from "../../../../useHarnessCapabilities";

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
	const harnesses = harnessChoices(useHarnessCapabilities());
	const harness = harnesses.includes(draft.harness) ? draft.harness : "claude";
	const { target, cloneState } = useDraftRepos(draft.node, draft.cwd);

	const submit = useDraftSubmit(draft, harness, target, launchers, onClose);

	return (
		<AutoFocusDialog onClose={onClose} onEntered={focus.restore} centered>
			<form onSubmit={submit}>
				<LoadingFieldset
					loading={draft.modePending}
					restoreFocus={focus.restore}
				>
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
					<NewSessionFooter
						submitLabel={
							target.kind === "clone"
								? "Clone"
								: newSessionModes[draft.mode].submitLabel
						}
						disabled={target.kind === "blocked"}
						loading={draft.modePending}
					/>
				</LoadingFieldset>
			</form>
		</AutoFocusDialog>
	);
}
