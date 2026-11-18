export function flexItems(box: Element): Element[] {
	return Array.from(box.children).flatMap((child) =>
		getComputedStyle(child).display === "contents" ? flexItems(child) : [child],
	);
}
