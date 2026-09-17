import { parsePrBody } from "../../prs/parsePrBody";
import type { CheckOutcome } from "./types";

function sectionContent(body: string, heading: string): string | null {
	const section = parsePrBody(body).find(
		(candidate) => candidate.heading.trim().toLowerCase() === heading,
	);
	return section ? section.content.trim() : null;
}

function describe(heading: string, content: string | null): string | null {
	if (content === null) return `no \`## ${heading}\` section`;
	if (content === "") return `\`## ${heading}\` is empty`;
	return null;
}

export function checkDescriptionSections(body: string): CheckOutcome {
	const problems = [
		describe("What", sectionContent(body, "what")),
		describe("Why", sectionContent(body, "why")),
	].filter((problem): problem is string => problem !== null);
	if (problems.length > 0)
		return { status: "fail", reason: problems.join("; ") };
	const how = sectionContent(body, "how");
	const optional = how ? ", plus an optional `## How`" : "";
	return {
		status: "pass",
		reason: `\`## What\` and \`## Why\` are both present${optional}`,
	};
}
