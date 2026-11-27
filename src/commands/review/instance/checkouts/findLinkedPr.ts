function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
}

export function findLinkedPr(body: string, fullName: string): number | null {
	const name = escapeRegExp(fullName);
	const patterns = [
		new RegExp(`github\\.com/${name}/pull/(\\d+)`, "i"),
		new RegExp(`(?:^|[^\\w./-])${name}#(\\d+)\\b`, "i"),
	];
	for (const pattern of patterns) {
		const match = body.match(pattern);
		if (match) return Number(match[1]);
	}
	return null;
}
