import type { FormEvent } from "react";
import { harnessChoices } from "./NewSessionDialog/harnessChoices";
import {
	launchNewSession,
	type NewSessionLaunchers,
} from "./NewSessionDialog/launchNewSession";
import { NewSessionFields } from "./NewSessionDialog/NewSessionFields";
import { NewSessionFooter } from "./NewSessionDialog/NewSessionFooter";
import { newSessionModes } from "./NewSessionDialog/newSessionModes";
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
	const { cwd } = useDraftRepos(draft.node, draft.cwd);

	const submit = (e: FormEvent) => {
		e.preventDefault();
		launchNewSession(
			{
				mode: draft.mode,
				harness,
				prompt: draft.prompt,
				cwd,
				node: draft.node,
			},
			launchers,
		);
		draft.clear();
		onClose();
	};

	return (
		<AutoFocusDialog onClose={onClose} onEntered={focus.restore} centered>
			<form onSubmit={submit}>
				<NewSessionFields
					draft={draft}
					harness={harness}
					harnesses={harnesses}
					focus={focus}
				/>
				<NewSessionFooter
					submitLabel={newSessionModes[draft.mode].submitLabel}
				/>
			</form>
		</AutoFocusDialog>
	);
}
