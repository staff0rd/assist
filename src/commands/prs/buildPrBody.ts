import { formatResolvesReference } from "./formatResolvesReference";

type PrSections = {
	what: string;
	why: string;
	how?: string;
	resolves?: string[];
};

export function renderWhy(why: string, resolves?: string[]): string {
	if (resolves && resolves.length > 0) {
		const refs = resolves.map(formatResolvesReference).join(", ");
		return `${why}\n\nResolves ${refs}`;
	}
	return why;
}

export function buildPrBody(sections: PrSections): string {
	const parts = [
		`## What\n\n${sections.what}`,
		`## Why\n\n${renderWhy(sections.why, sections.resolves)}`,
	];

	if (sections.how) {
		parts.push(`## How\n\n${sections.how}`);
	}

	return parts.join("\n\n");
}
