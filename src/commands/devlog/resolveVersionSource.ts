import { execFileSync } from "node:child_process";
import { earliestSemverTag } from "./earliestSemverTag";
import { getVersionAtCommit } from "./getVersionAtCommit";
import { isPackageVersionStale } from "./isPackageVersionStale";
import { latestSemverTag } from "./latestSemverTag";
import { stripToMinor } from "./stripToMinor";

export type VersionSource = {
	kind: "tags" | "package";
	versionAt: (hash: string) => string | null;
	current: () => string | null;
};

function gitTags(...args: string[]): string[] {
	return execFileSync("git", ["tag", "--list", ...args], { encoding: "utf8" })
		.split("\n")
		.map((t) => t.trim())
		.filter(Boolean);
}

export function resolveVersionSource(): VersionSource {
	const headVersion = getVersionAtCommit("HEAD");
	const mergedTags = gitTags("--merged", "HEAD");
	if (isPackageVersionStale(headVersion, mergedTags)) {
		return {
			kind: "tags",
			versionAt: (hash) => earliestSemverTag(gitTags("--contains", hash)),
			current: () => latestSemverTag(mergedTags),
		};
	}
	return {
		kind: "package",
		versionAt: getVersionAtCommit,
		current: () => (headVersion ? stripToMinor(headVersion) : null),
	};
}
