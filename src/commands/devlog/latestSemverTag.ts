import { sortedSemverVersions } from "./sortedSemverVersions";

export function latestSemverTag(tags: string[]): string | null {
	const latest = sortedSemverVersions(tags).at(-1);
	return latest ? `v${latest}` : null;
}
