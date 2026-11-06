import semver from "semver";

export function sortedSemverVersions(tags: string[]): string[] {
	return tags
		.map((tag) => semver.clean(tag))
		.filter((v): v is string => v !== null)
		.sort(semver.compare);
}
