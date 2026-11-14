export function phoneScrollers(page: HTMLElement): HTMLElement[] {
	return [...page.querySelectorAll<HTMLElement>("[data-phone-scroll]")];
}
