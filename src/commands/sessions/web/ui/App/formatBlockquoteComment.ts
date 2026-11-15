export function formatBlockquoteComment(quote: string, note: string): string {
	const quoted = quote
		.split("\n")
		.map((line) => (line ? `> ${line}` : ">"))
		.join("\n");
	return `${quoted}\n\n${note}`;
}
