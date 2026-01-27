import { execSync } from "node:child_process";
import semver from "semver";
import type { AssistConfig } from "../../shared/types.js";
import { loadDevlogEntries } from "./loadDevlogEntries.js";

type LastVersionInfo = {
	date: string;
	version: string;
};

function getVersionAtCommit(hash: string): string | null {
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

function stripToMinor(version: string): string {
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

export function getLastVersionInfo(
	repoName: string,
	config?: AssistConfig,
): LastVersionInfo | null {
	if (config?.commit?.conventional) {
		return getLastVersionInfoFromGit();
	}

	const entries = loadDevlogEntries(repoName);
	if (entries.size === 0) {
		return null;
	}

	const dates = Array.from(entries.keys()).sort().reverse();
	const lastDate = dates[0];
	if (!lastDate) {
		return null;
	}

	const lastEntries = entries.get(lastDate);
	const lastVersion = lastEntries?.[0]?.version;
	if (!lastVersion) {
		return null;
	}

	return { date: lastDate, version: lastVersion };
}

export function bumpVersion(version: string, type: "patch" | "minor"): string {
	const cleaned = semver.clean(version) ?? semver.coerce(version)?.version;
	if (!cleaned) {
		return version;
	}
	const bumped = semver.inc(cleaned, type);
	if (!bumped) {
		return version;
	}
	if (type === "minor") {
		// Remove patch number for minor versions (v1.3.0 -> v1.3)
		const parsed = semver.parse(bumped);
		return parsed ? `v${parsed.major}.${parsed.minor}` : `v${bumped}`;
	}
	return `v${bumped}`;
}
