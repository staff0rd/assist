import type { MouseEvent } from "react";
import type { ShortcutName } from "../shortcutRegistry";

export function actionButtonAttributes({
	label,
	onClick,
	title,
	ariaLabel,
	disabled,
	pressed,
	shortcut,
}: {
	label: string;
	onClick: (event: MouseEvent<HTMLElement>) => void;
	title?: string;
	ariaLabel?: string;
	disabled?: boolean;
	pressed?: boolean;
	shortcut?: ShortcutName;
}) {
	return {
		onClick,
		disabled,
		title: shortcut ? undefined : title,
		"aria-label": ariaLabel ?? title ?? label,
		"aria-pressed": pressed,
		"data-shortcut": shortcut,
	};
}
