import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { NewSessionDialog } from "./NewSessionLayer/NewSessionDialog";
import { useDefaultNewSessionMode } from "./NewSessionLayer/useDefaultNewSessionMode";
import { useNewSessionHotkey } from "./NewSessionLayer/useNewSessionHotkey";

export function NewSessionLayer({
	onCreate,
	onCreateAssist,
}: {
	onCreate: (prompt: string, cwd?: string) => void;
	onCreateAssist: (args: string[], cwd?: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const defaultMode = useDefaultNewSessionMode();
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

	if (!open || !defaultMode) return null;
	return (
		<NewSessionDialog
			defaultMode={defaultMode}
			onCreate={onCreate}
			onCreateAssist={onCreateAssist}
			onClose={() => setOpen(false)}
		/>
	);
}
