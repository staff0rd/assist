import { useCallback, useState } from "react";
import { NewSessionDialog } from "./NewSessionDialog";
import { useNewSessionHotkey } from "./useNewSessionHotkey";

export function NewSessionLayer({
	onCreate,
	onCreateAssist,
}: {
	onCreate: (prompt: string, cwd?: string) => void;
	onCreateAssist: (args: string[], cwd?: string) => void;
}) {
	const [open, setOpen] = useState(false);
	useNewSessionHotkey(useCallback(() => setOpen(true), []));

	if (!open) return null;
	return (
		<NewSessionDialog
			onCreate={onCreate}
			onCreateAssist={onCreateAssist}
			onClose={() => setOpen(false)}
		/>
	);
}
