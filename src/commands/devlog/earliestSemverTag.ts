import semver from "semver";

export function earliestSemverTag(tags: string[]): string | null {
	const versions = tags
		.map((tag) => semver.clean(tag))
		.filter((v): v is string => v !== null)
		.sort(semver.compare);
	return versions.length > 0 ? `v${versions[0]}` : null;
}
