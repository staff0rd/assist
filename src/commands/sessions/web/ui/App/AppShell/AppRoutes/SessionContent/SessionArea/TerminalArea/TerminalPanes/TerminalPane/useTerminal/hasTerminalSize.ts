export function hasTerminalSize(el: HTMLElement | null): boolean {
	return el !== null && el.clientWidth > 0 && el.clientHeight > 0;
}
