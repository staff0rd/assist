const MAX_WORDS = 8;
const MAX_LENGTH = 60;

export function noteItemName(text: string): string {
	const words = text.trim().split(/\s+/).slice(0, MAX_WORDS).join(" ");
	const name = words.replace(/[\s.,;:!?]+$/, "");
	return name.length > MAX_LENGTH
		? `${name.slice(0, MAX_LENGTH).trimEnd()}…`
		: name;
}
