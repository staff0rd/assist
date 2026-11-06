import { execFileSync } from "node:child_process";
import { earliestSemverTag } from "./earliestSemverTag";
import { getVersionAtCommit } from "./getVersionAtCommit";
import { isPackageVersionStale } from "./isPackageVersionStale";

export type VersionSource = {
	kind: "tags" | "package";
	versionAt: (hash: string) => string | null;
};

function gitTags(...args: string[]): string[] {
	return execFileSync("git", ["tag", "--list", ...args], { encoding: "utf8" })
		.split("\n")
		.map((t) => t.trim())
		.filter(Boolean);
}

export function resolveVersionSource(): VersionSource {
	if (isPackageVersionStale(getVersionAtCommit("HEAD"), gitTags())) {
		return {
			kind: "tags",
			versionAt: (hash) => earliestSemverTag(gitTags("--contains", hash)),
		};
	}
	return { kind: "package", versionAt: getVersionAtCommit };
}
