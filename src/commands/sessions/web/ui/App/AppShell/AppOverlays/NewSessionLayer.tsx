import { useCallback, useState } from "react";
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
	useNewSessionHotkey(useCallback(() => setOpen(true), []));

	if (!open) return null;
	return (
		<NewSessionDialog
			defaultMode={defaultMode}
			onCreate={onCreate}
			onCreateAssist={onCreateAssist}
			onClose={() => setOpen(false)}
		/>
	);
}
