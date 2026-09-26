import { useEffect } from "react";
import { useBlocker } from "react-router";
import { ConfirmDialog } from "../../../../../../../../backlog/web/ui/components/ConfirmDialog";

export function UnsavedChangesPrompt({ dirty }: { dirty: boolean }) {
	const blocker = useBlocker(dirty);

	useEffect(() => {
		if (!dirty) return;
		const warn = (event: BeforeUnloadEvent) => event.preventDefault();
		globalThis.addEventListener("beforeunload", warn);
		return () => globalThis.removeEventListener("beforeunload", warn);
	}, [dirty]);

	if (blocker.state !== "blocked") return null;

	return (
		<ConfirmDialog
			title="Discard unsaved changes?"
			message="This file has unsaved changes that will be lost."
			confirmLabel="Discard"
			onConfirm={() => blocker.proceed()}
			onCancel={() => blocker.reset()}
		/>
	);
}
