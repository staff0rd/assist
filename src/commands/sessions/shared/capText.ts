export function capText(text: string, maxLength: number): string {
	return text.length <= maxLength
		? text
		: `${text.slice(0, maxLength).trimEnd()}…`;
}
