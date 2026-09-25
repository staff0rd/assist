function fenceFor(quote: string): string {
	const longest = Math.max(
		0,
		...Array.from(quote.matchAll(/`+/g), (m) => m[0].length),
	);
	return "`".repeat(Math.max(3, longest + 1));
}

export function formatQuotedComment(quote: string, note: string): string {
	const fence = fenceFor(quote);
	return `${fence}\n${quote}\n${fence}\n\n${note}`;
}
