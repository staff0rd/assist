import type { FormEvent } from "react";
import { harnessChoices } from "./NewSessionDialog/harnessChoices";
import type { NewSessionLaunchers } from "./NewSessionDialog/launchNewSession";
import { NewSessionFields } from "./NewSessionDialog/NewSessionFields";
import { NewSessionFooter } from "./NewSessionDialog/NewSessionFooter";
import { newSessionModes } from "./NewSessionDialog/newSessionModes";
import { submitDraft } from "./NewSessionDialog/submitDraft";
import { useDraftFocus } from "./NewSessionDialog/useDraftFocus";
import { useDraftRepos } from "./NewSessionDialog/useDraftRepos";
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

	const submit = (e: FormEvent) => {
		e.preventDefault();
		if (submitDraft(draft, harness, target, launchers)) onClose();
	};

	return (
		<AutoFocusDialog onClose={onClose} onEntered={focus.restore} centered>
			<form onSubmit={submit}>
				<NewSessionFields
					draft={draft}
					harness={harness}
					harnesses={harnesses}
					focus={focus}
					cloneState={cloneState}
				/>
				<NewSessionFooter
					submitLabel={
						target.kind === "clone"
							? "Clone"
							: newSessionModes[draft.mode].submitLabel
					}
					disabled={target.kind === "blocked"}
				/>
			</form>
		</AutoFocusDialog>
	);
}
