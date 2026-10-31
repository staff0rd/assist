import { lastIndexWhere } from "./lastIndexWhere";
import { scanTags, type Tag } from "./scanTags";

export type HtmlPart = {
	kind: "open" | "close" | "run" | "space";
	text: string;
	tag?: string;
};

function unmatchedTags(tags: Tag[]): Tag[] {
	const stack: Tag[] = [];
	const unmatched: Tag[] = [];
	for (const tag of tags) {
		if (!tag.close) stack.push(tag);
		else {
			const index = lastIndexWhere(stack, (open) => open.name === tag.name);
			if (index !== -1) stack.length = index;
			else if (stack.length === 0) unmatched.push(tag);
		}
	}
	return [...unmatched, ...stack].sort((a, b) => a.start - b.start);
}

function multilineElements(value: string): Tag[] {
	const stack: Tag[] = [];
	const boundaries: Tag[] = [];
	for (const tag of scanTags(value)) {
		if (!tag.close) stack.push(tag);
		else {
			const index = lastIndexWhere(stack, (open) => open.name === tag.name);
			if (index === 0 && value.slice(stack[0].end, tag.start).includes("\n"))
				boundaries.push(stack[0], tag);
			if (index !== -1) stack.length = index;
		}
	}
	return boundaries;
}

function textParts(text: string): HtmlPart[] {
	if (!text) return [];
	if (!text.trim()) return [{ kind: "space", text }];
	const boundaries = multilineElements(text);
	if (boundaries.length === 0) return [{ kind: "run", text }];
	return splitAt(text, boundaries);
}

function splitAt(value: string, boundaries: Tag[]): HtmlPart[] {
	const parts: HtmlPart[] = [];
	let offset = 0;
	for (const tag of boundaries) {
		parts.push(...textParts(value.slice(offset, tag.start)));
		parts.push({
			kind: tag.close ? "close" : "open",
			text: value.slice(tag.start, tag.end),
			tag: tag.name,
		});
		offset = tag.end;
	}
	parts.push(...textParts(value.slice(offset)));
	return parts;
}

export function splitHtml(value: string): HtmlPart[] {
	return splitAt(value, unmatchedTags(scanTags(value)));
}
