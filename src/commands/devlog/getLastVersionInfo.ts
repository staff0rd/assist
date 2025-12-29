import semver from "semver";
import { loadDevlogEntries } from "./loadDevlogEntries.js";

type LastVersionInfo = {
	date: string;
	version: string;
};

export function getLastVersionInfo(repoName: string): LastVersionInfo | null {
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
