import type { VersionSource } from "../resolveVersionSource";
import { stripToMinor } from "../stripToMinor";
import type { Commit } from "../types";

export type VersionedCommit = Commit & { version: string | null };

export function withVersions(
	commits: Commit[],
	source: VersionSource,
	hasTags: boolean,
): VersionedCommit[] {
	const raw = commits.map((commit) => source.versionAt(commit.hash));
	if (source.kind === "tags") {
		return commits.map((commit, i) => ({ ...commit, version: raw[i] }));
	}
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
