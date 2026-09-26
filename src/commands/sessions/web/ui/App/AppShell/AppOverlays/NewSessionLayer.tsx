import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { NewSessionDialog } from "./NewSessionLayer/NewSessionDialog";
import { useDefaultNewSessionMode } from "./NewSessionLayer/useDefaultNewSessionMode";
import { useNewSessionDraft } from "./NewSessionLayer/useNewSessionDraft";
import { useNewSessionHotkey } from "./NewSessionLayer/useNewSessionHotkey";

export function NewSessionLayer({
	onCreate,
	onCreateAssist,
}: {
	onCreate: (prompt: string, cwd?: string) => void;
	onCreateAssist: (args: string[], cwd?: string) => void;
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
			onCreate={onCreate}
			onCreateAssist={onCreateAssist}
			onClose={() => setOpen(false)}
		/>
	);
}
