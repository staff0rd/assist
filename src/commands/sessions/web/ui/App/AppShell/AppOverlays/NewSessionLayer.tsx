import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { NewSessionDialog } from "./NewSessionLayer/NewSessionDialog";
import type { NewSessionLaunchers } from "./NewSessionLayer/launchNewSession";
import { useNewSessionDraft } from "./NewSessionLayer/useNewSessionDraft";
import { useNewSessionHotkey } from "./NewSessionLayer/useNewSessionHotkey";
import { useRepoSelectionContext } from "../../../useRepoSelectionContext";

export function NewSessionLayer({
	launchers,
}: {
	launchers: NewSessionLaunchers;
}) {
	const [open, setOpen] = useState(false);
	const draft = useNewSessionDraft();
	const { selectedCwd } = useRepoSelectionContext();
	const [searchParams, setSearchParams] = useSearchParams();
	const prefill = searchParams.get("new");
	const { setPrompt, setCwd, setFocus } = draft ?? {};
	useNewSessionHotkey(useCallback(() => setOpen(true), []));

	useEffect(() => {
		if (prefill === null || !setPrompt || !setCwd || !setFocus) return;
		if (prefill) {
			setPrompt(prefill);
			setCwd(selectedCwd);
			setFocus({
				field: "prompt",
				selectionStart: prefill.length,
				selectionEnd: prefill.length,
			});
		}
		setOpen(true);
		setSearchParams(
			(params) => {
				params.delete("new");
				return params;
			},
			{ replace: true },
		);
	}, [prefill, setPrompt, setCwd, setFocus, selectedCwd, setSearchParams]);

	if (!open || !draft) return null;
	return (
		<NewSessionDialog
			draft={draft}
			launchers={launchers}
			onClose={() => setOpen(false)}
		/>
	);
}
