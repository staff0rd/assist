import { execSync } from "node:child_process";
import semver from "semver";
import type { AssistConfig } from "../../shared/types";
import { loadDevlogEntries } from "./loadDevlogEntries";

type LastVersionInfo = {
	date: string;
	version: string;
};

export function getVersionAtCommit(hash: string): string | null {
	try {
		const content = execSync(`git show ${hash}:package.json`, {
			encoding: "utf-8",
		});
		const pkg = JSON.parse(content);
		return pkg.version ?? null;
	} catch {
		return null;
	}
}

export function stripToMinor(version: string): string {
	const parsed = semver.parse(semver.coerce(version));
	return parsed ? `v${parsed.major}.${parsed.minor}` : `v${version}`;
}

function getLastVersionInfoFromGit(): LastVersionInfo | null {
	try {
		// Get last commit hash and date
		const output = execSync(
			"git log -1 --pretty=format:'%ad|%h' --date=short",
			{
				encoding: "utf-8",
			},
		).trim();
		const [date, hash] = output.split("|");
		if (!date || !hash) return null;

		const version = getVersionAtCommit(hash);
		if (!version) return null;

		return { date, version: stripToMinor(version) };
	} catch {
		return null;
	}
}

function findLastDate(entries: Map<string, unknown[]>): string | null {
	const dates = Array.from(entries.keys()).sort().reverse();
	return dates[0] ?? null;
}

export function getLastVersionInfo(
	repoName: string,
	config?: AssistConfig,
): LastVersionInfo | null {
	const entries = loadDevlogEntries(repoName);
	const lastDate = findLastDate(entries);
	if (!lastDate) return null;

	if (config?.commit?.conventional) {
		const gitInfo = getLastVersionInfoFromGit();
		if (gitInfo) return { date: lastDate, version: gitInfo.version };
	}

	const lastVersion = entries.get(lastDate)?.[0]?.version;
	return lastVersion ? { date: lastDate, version: lastVersion } : null;
}

function cleanVersion(version: string): string | null {
	return semver.clean(version) ?? semver.coerce(version)?.version ?? null;
}

export function bumpVersion(version: string, type: "patch" | "minor"): string {
	const cleaned = cleanVersion(version);
	if (!cleaned) return version;

	const bumped = semver.inc(cleaned, type);
	if (!bumped) return version;

	if (type === "minor") return stripToMinor(bumped);
	return `v${bumped}`;
}
