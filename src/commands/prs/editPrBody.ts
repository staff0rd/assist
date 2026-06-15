import { renderWhy } from "./buildPrBody";
import {
	type PrBodySection,
	parsePrBody,
	serializePrBody,
} from "./parsePrBody";

type EditSections = {
	what?: string;
	why?: string;
	how?: string;
	resolves?: string[];
};

function stripResolves(content: string): string {
	return content.replace(/\n+Resolves [^\n]*$/, "").trimEnd();
}

function extractResolves(content: string): string {
	const match = /\n+(Resolves [^\n]*)$/.exec(content);
	return match ? match[1] : "";
}

export function editPrBody(body: string, sections: EditSections): string {
	const parsed = parsePrBody(body);

	const find = (heading: string): PrBodySection | undefined =>
		parsed.find((s) => s.heading.toLowerCase() === heading.toLowerCase());

	const upsert = (heading: string, content: string) => {
		const existing = find(heading);
		if (existing) existing.content = content;
		else parsed.push({ heading, content });
	};

	if (sections.what !== undefined) upsert("What", sections.what);

	const hasResolves = (sections.resolves?.length ?? 0) > 0;
	if (sections.why !== undefined || hasResolves) {
		const existingWhy = find("Why")?.content ?? "";
		const baseWhy =
			sections.why !== undefined ? sections.why : stripResolves(existingWhy);
		if (hasResolves) {
			upsert("Why", renderWhy(baseWhy, sections.resolves));
		} else {
			const resolves = extractResolves(existingWhy);
			upsert("Why", resolves ? `${baseWhy}\n\n${resolves}` : baseWhy);
		}
	}

	if (sections.how !== undefined) upsert("How", sections.how);

	return serializePrBody(parsed);
}
