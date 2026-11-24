const MAX_LENGTH = 200;

export function tooVerboseExcerpt(text: string): string {
	const trimmed = text.trim();
	if (trimmed.length <= MAX_LENGTH) return trimmed;
	return `${trimmed.slice(0, MAX_LENGTH).trimEnd()}…`;
}
