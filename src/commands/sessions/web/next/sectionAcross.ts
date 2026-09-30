import { ghErrorText } from "./ghErrorText";
import type { NextSection } from "./types";

export async function sectionAcross<T extends { url: string }>(
	repos: string[],
	load: (repo: string) => Promise<T[]>,
	compare: (a: T, b: T) => number,
): Promise<NextSection<T>> {
	if (repos.length === 0)
		return {
			items: [],
			error:
				"No GitHub repo to read: set next.repos or select a repo with a GitHub origin.",
		};
	const results = await Promise.allSettled(repos.map((repo) => load(repo)));
	const items = new Map<string, T>();
	const errors: string[] = [];
	results.forEach((result, index) => {
		if (result.status === "fulfilled")
			for (const item of result.value) items.set(item.url, item);
		else errors.push(`${repos[index]}: ${ghErrorText(result.reason)}`);
	});
	return {
		items: [...items.values()].sort(compare),
		error: errors.length > 0 ? errors.join("\n") : null,
	};
}
