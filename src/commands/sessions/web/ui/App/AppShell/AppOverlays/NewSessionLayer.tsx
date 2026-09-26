import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { NewSessionDialog } from "./NewSessionLayer/NewSessionDialog";
import type { NewSessionLaunchers } from "./NewSessionLayer/NewSessionDialog/launchNewSession";
import { useDefaultNewSessionMode } from "./NewSessionLayer/useDefaultNewSessionMode";
import { useNewSessionDraft } from "./NewSessionLayer/useNewSessionDraft";
import { useNewSessionHotkey } from "./NewSessionLayer/useNewSessionHotkey";

export function NewSessionLayer({
	launchers,
}: {
	launchers: NewSessionLaunchers;
}) {
	const [open, setOpen] = useState(false);
	const draft = useNewSessionDraft(useDefaultNewSessionMode());
	const [searchParams, setSearchParams] = useSearchParams();
	const requested = searchParams.has("new");
	useNewSessionHotkey(useCallback(() => setOpen(true), []));

	useEffect(() => {
		if (!requested) return;
		setOpen(true);
		setSearchParams(
			(params) => {
				params.delete("new");
				return params;
			},
			{ replace: true },
		);
	}, [requested, setSearchParams]);

	if (!open || !draft) return null;
	return (
		<NewSessionDialog
			draft={draft}
			launchers={launchers}
			onClose={() => setOpen(false)}
		/>
	);
}
