import type { FormEvent, ReactNode } from "react";
import { AutoFocusDialog } from "../../AutoFocusDialog";

export function NewSessionDialogFrame({
	onClose,
	onEntered,
	onSubmit,
	children,
}: {
	onClose: () => void;
	onEntered: () => void;
	onSubmit: (e: FormEvent) => void;
	children: ReactNode;
}) {
	return (
		<AutoFocusDialog
			onClose={onClose}
			onEntered={onEntered}
			centered
			maxWidth="md"
		>
			<form onSubmit={onSubmit}>{children}</form>
		</AutoFocusDialog>
	);
}
