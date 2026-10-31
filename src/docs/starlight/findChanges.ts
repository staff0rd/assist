import { docsDiffClasses } from "./renderDiffBlock";

const highlight = Object.values(docsDiffClasses)
	.map((name) => `.${name}`)
	.join(",");

export function findChanges(content: Element): Element[][] {
	const changes: Element[][] = [];
	for (const element of content.querySelectorAll(highlight)) {
		if (element.parentElement?.closest(highlight)) continue;
		const previous = changes.at(-1);
		if (previous?.at(-1) === element.previousElementSibling)
			previous?.push(element);
		else changes.push([element]);
	}
	return changes;
}
