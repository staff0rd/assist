export function changeCursor(changes: Element[][], status: HTMLElement) {
	let current = -1;
	status.textContent =
		changes.length === 1 ? "1 change" : `${changes.length} changes`;
	return {
		get current() {
			return current;
		},
		show(index: number) {
			for (const element of changes[current] ?? [])
				element.classList.remove("assist-diff-focus");
			current = (index + changes.length) % changes.length;
			const change = changes[current];
			for (const element of change) element.classList.add("assist-diff-focus");
			change[0].scrollIntoView({ behavior: "smooth", block: "center" });
			status.textContent = `change ${current + 1} of ${changes.length}`;
		},
	};
}
