function button(doc: Document, label: string, text: string) {
	const element = doc.createElement("button");
	element.type = "button";
	element.ariaLabel = label;
	element.title = label;
	element.textContent = text;
	return element;
}

export function changeStepper(doc: Document, changes: Element[][]) {
	const status = doc.createElement("span");
	const previous = button(doc, "Previous change", "‹");
	const next = button(doc, "Next change", "›");
	previous.disabled = changes.length === 0;
	next.disabled = changes.length === 0;
	status.textContent =
		changes.length === 1 ? "1 change" : `${changes.length} changes`;
	let current = -1;
	const show = (index: number) => {
		for (const element of changes[current] ?? [])
			element.classList.remove("assist-diff-focus");
		current = (index + changes.length) % changes.length;
		const change = changes[current];
		for (const element of change) element.classList.add("assist-diff-focus");
		change[0].scrollIntoView({ behavior: "smooth", block: "center" });
		status.textContent = `change ${current + 1} of ${changes.length}`;
	};
	previous.addEventListener("click", () =>
		show(current < 0 ? changes.length - 1 : current - 1),
	);
	next.addEventListener("click", () => show(current + 1));
	return [previous, status, next];
}
