import type { Commit } from "../types";
import { stripToMinor } from "../stripToMinor";

export type VersionedCommit = Commit & { version: string | null };

export function withVersions(
	commits: Commit[],
	versionAt: (hash: string) => string | null,
	hasTags: boolean,
): VersionedCommit[] {
	const raw = commits.map((commit) => versionAt(commit.hash));
	const distinct = new Set(raw.filter((v): v is string => v !== null));
	const unversioned = !hasTags && distinct.size <= 1;
	return commits.map((commit, i) => {
		const version = raw[i];
		return {
			...commit,
			version: !unversioned && version ? stripToMinor(version) : null,
		};
	});
}
