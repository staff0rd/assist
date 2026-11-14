import { type KeyboardEvent, useState } from "react";

type Field = HTMLTextAreaElement | HTMLInputElement;

/* why: like Claude Code's bash mode, a leading `!` switches the field to shell
 * mode and is dropped from the text, so backspace on an empty field leaves it. */
export function useShellMode(enabled: boolean) {
	const [on, setOn] = useState(false);
	const shell = enabled && on;
	return {
		shell,
		enter: (field: Field) => {
			if (!enabled || on || !field.value.startsWith("!")) return;
			setOn(true);
			field.value = field.value.slice(1);
		},
		leaveOnBackspace: (e: KeyboardEvent, text: string): boolean => {
			if (!shell || e.key !== "Backspace" || text) return false;
			e.preventDefault();
			setOn(false);
			return true;
		},
		leave: () => setOn(false),
	};
}
