import { changeCursor } from "./changeCursor";

const changeHash = {
	first: "#assist-change-first",
	last: "#assist-change-last",
};

type StepperPages = {
	previous?: string;
	next?: string;
	go: (href: string) => void;
};

function button(doc: Document, label: string, text: string) {
	const element = doc.createElement("button");
	element.type = "button";
	element.ariaLabel = label;
	element.title = label;
	element.textContent = text;
	return element;
}

export function changeStepper(
	doc: Document,
	changes: Element[][],
	pages: StepperPages,
) {
	const status = doc.createElement("span");
	const previous = button(doc, "Previous change", "‹");
	const next = button(doc, "Next change", "›");
	previous.disabled = changes.length === 0 && !pages.previous;
	next.disabled = changes.length === 0 && !pages.next;
	const cursor = changeCursor(changes, status);
	previous.addEventListener("click", () => {
		if (cursor.current > 0) cursor.show(cursor.current - 1);
		else if (pages.previous) pages.go(pages.previous + changeHash.last);
		else cursor.show(changes.length - 1);
	});
	next.addEventListener("click", () => {
		if (cursor.current < changes.length - 1) cursor.show(cursor.current + 1);
		else if (pages.next) pages.go(pages.next + changeHash.first);
		else cursor.show(0);
	});
	const start = doc.location.hash;
	if (changes.length && start === changeHash.first) cursor.show(0);
	if (changes.length && start === changeHash.last)
		cursor.show(changes.length - 1);
	return [previous, status, next];
}
