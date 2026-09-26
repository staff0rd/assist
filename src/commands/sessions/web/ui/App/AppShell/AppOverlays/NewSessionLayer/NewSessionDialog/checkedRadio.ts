export function checkedRadio(group: HTMLElement | null) {
	return group?.querySelector<HTMLElement>('[aria-checked="true"]');
}
