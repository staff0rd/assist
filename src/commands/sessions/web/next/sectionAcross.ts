import type { NextSection } from "./types";

function errorMessage(error: unknown): string {
	const stderr = (error as { stderr?: unknown }).stderr;
	if (typeof stderr === "string" && stderr.trim()) return stderr.trim();
	return error instanceof Error ? error.message : String(error);
}

export async function sectionAcross<T>(
	repos: string[],
	load: (repo: string) => Promise<T[]>,
	compare: (a: T, b: T) => number,
	unsetKey: string,
): Promise<NextSection<T>> {
	if (repos.length === 0)
		return {
			items: [],
			error: `No GitHub repo to read: set ${unsetKey} or select a repo with a GitHub origin.`,
		};
	const results = await Promise.allSettled(repos.map((repo) => load(repo)));
	const items: T[] = [];
	const errors: string[] = [];
	results.forEach((result, index) => {
		if (result.status === "fulfilled") items.push(...result.value);
		else errors.push(`${repos[index]}: ${errorMessage(result.reason)}`);
	});
	return {
		items: items.sort(compare),
		error: errors.length > 0 ? errors.join("\n") : null,
	};
}
