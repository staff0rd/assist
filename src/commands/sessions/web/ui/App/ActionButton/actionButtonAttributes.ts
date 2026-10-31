import type { KeyboardEvent, MouseEvent } from "react";
import type { ShortcutName } from "../shortcutRegistry";

export function actionButtonAttributes({
	label,
	onClick,
	onKeyDown,
	title,
	ariaLabel,
	disabled,
	pressed,
	shortcut,
}: {
	label: string;
	onClick: (event: MouseEvent<HTMLElement>) => void;
	onKeyDown?: (event: KeyboardEvent<HTMLElement>) => void;
	title?: string;
	ariaLabel?: string;
	disabled?: boolean;
	pressed?: boolean;
	shortcut?: ShortcutName;
}) {
	return {
		onClick,
		onKeyDown,
		disabled,
		title: shortcut ? undefined : title,
		"aria-label": ariaLabel ?? title ?? label,
		"aria-pressed": pressed,
		"data-shortcut": shortcut,
	};
}
