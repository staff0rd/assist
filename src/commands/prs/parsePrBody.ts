export type PrBodySection = { heading: string; content: string };

export function parsePrBody(body: string): PrBodySection[] {
	const sections: PrBodySection[] = [];
	let current: { heading: string; lines: string[] } | null = null;

	const flush = () => {
		if (current) {
			sections.push({
				heading: current.heading,
				content: current.lines.join("\n").trim(),
			});
		}
	};

	for (const line of body.split("\n")) {
		const match = /^##\s+(.+?)\s*$/.exec(line);
		if (match) {
			flush();
			current = { heading: match[1], lines: [] };
		} else if (current) {
			current.lines.push(line);
		}
	}
	flush();

	return sections;
}

export function serializePrBody(sections: PrBodySection[]): string {
	return sections
		.map((section) => `## ${section.heading}\n\n${section.content}`)
		.join("\n\n");
}
