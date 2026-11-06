import { sortedSemverVersions } from "./sortedSemverVersions";

export function earliestSemverTag(tags: string[]): string | null {
	const earliest = sortedSemverVersions(tags).at(0);
	return earliest ? `v${earliest}` : null;
}
