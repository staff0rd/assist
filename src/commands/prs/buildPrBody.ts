import { loadJson } from "../../shared/loadJson";

type PrSections = {
	what: string;
	why: string;
	how?: string;
	resolves?: string[];
};

function jiraBrowseUrl(key: string): string {
	const { site } = loadJson<{ site?: string }>("jira.json");
	return site ? `https://${site}/browse/${key}` : key;
}

export function renderWhy(why: string, resolves?: string[]): string {
	if (resolves && resolves.length > 0) {
		const urls = resolves.map(jiraBrowseUrl).join(", ");
		return `${why}\n\nResolves ${urls}`;
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
