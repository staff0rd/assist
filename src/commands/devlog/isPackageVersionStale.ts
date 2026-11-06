import semver from "semver";

export function isPackageVersionStale(
	packageVersion: string | null,
	tags: string[],
): boolean {
	const versions = tags
		.map((tag) => semver.clean(tag))
		.filter((v): v is string => v !== null);
	if (versions.length === 0) return false;
	const latest = semver.rsort(versions)[0];
	const current = packageVersion ? semver.clean(packageVersion) : null;
	return current === null || semver.lt(current, latest);
}
