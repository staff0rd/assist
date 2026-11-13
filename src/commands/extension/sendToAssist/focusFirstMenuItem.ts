export function focusFirstMenuItem(menu: HTMLElement | null) {
	menu
		?.querySelector<HTMLElement>(
			'[role^="menuitem"]:not([aria-disabled="true"])',
		)
		?.focus();
}
