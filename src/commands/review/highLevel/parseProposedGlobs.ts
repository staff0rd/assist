import type { ProposedGlobs } from "./ProposedGlobs";

const MAX_GLOBS = 8;

export function parseProposedGlobs(output: string): ProposedGlobs {
	const parsed = parseJsonObject(output);
	return {
		criticalPaths: readGlobs(parsed?.criticalPaths),
		uiPaths: readGlobs(parsed?.uiPaths),
	};
}

function parseJsonObject(output: string): Record<string, unknown> | undefined {
	const start = output.indexOf("{");
	const end = output.lastIndexOf("}");
	if (start === -1 || end <= start) return undefined;
	try {
		const parsed: unknown = JSON.parse(output.slice(start, end + 1));
		if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed))
			return undefined;
		return parsed as Record<string, unknown>;
	} catch {
		return undefined;
	}
}

function readGlobs(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	const globs = value
		.filter((item): item is string => typeof item === "string")
		.map((item) => item.trim())
		.filter((item) => item !== "");
	return [...new Set(globs)].slice(0, MAX_GLOBS);
}
