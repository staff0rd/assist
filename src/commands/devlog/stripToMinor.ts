import semver from "semver";

export function stripToMinor(version: string): string {
	const parsed = semver.parse(semver.coerce(version));
	return parsed ? `v${parsed.major}.${parsed.minor}` : `v${version}`;
}
