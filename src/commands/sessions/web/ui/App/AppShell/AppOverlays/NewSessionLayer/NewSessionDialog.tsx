import type { FormEvent } from "react";
import { launchNewSession } from "./NewSessionDialog/launchNewSession";
import { NewSessionFields } from "./NewSessionDialog/NewSessionFields";
import { NewSessionFooter } from "./NewSessionDialog/NewSessionFooter";
import { newSessionModes } from "./NewSessionDialog/newSessionModes";
import { useDraftFocus } from "./NewSessionDialog/useDraftFocus";
import type { NewSessionDraft } from "./useNewSessionDraft";
import { AutoFocusDialog } from "../AutoFocusDialog";

export function NewSessionDialog({
	draft,
	onCreate,
	onCreateAssist,
	onClose,
}: {
	draft: NewSessionDraft;
	onCreate: (prompt: string, cwd?: string) => void;
	onCreateAssist: (args: string[], cwd?: string) => void;
	onClose: () => void;
}) {
	const focus = useDraftFocus(draft.focus, draft.setFocus);

	const submit = (e: FormEvent) => {
		e.preventDefault();
		launchNewSession(draft.mode, draft.prompt, draft.cwd, {
			onCreate,
			onCreateAssist,
		});
		draft.clear();
		onClose();
	};

	return (
		<AutoFocusDialog onClose={onClose} onEntered={focus.restore} centered>
			<form onSubmit={submit}>
				<NewSessionFields draft={draft} focus={focus} />
				<NewSessionFooter
					submitLabel={newSessionModes[draft.mode].submitLabel}
				/>
			</form>
		</AutoFocusDialog>
	);
}
