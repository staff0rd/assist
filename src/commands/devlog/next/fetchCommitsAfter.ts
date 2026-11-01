import { execFileSync } from "node:child_process";
import type { Commit } from "../types";

const RECORD_SEPARATOR = "\x1e";

function parseRecord(record: string): Commit | null {
	const [header, ...fileLines] = record.trim().split("\n");
	if (!header) return null;
	const [date, hash, ...messageParts] = header.split("|");
	if (!date || !hash) return null;
	return {
		date,
		hash,
		message: messageParts.join("|"),
		files: fileLines.filter(Boolean),
	};
}

function isIgnored(commit: Commit, ignore: string[]): boolean {
	if (ignore.length === 0 || commit.files.length === 0) return false;
	return commit.files.every((file) => ignore.some((p) => file.startsWith(p)));
}

export function parseNameOnlyLog(
	output: string,
	ignore: string[],
	afterDate: string | null,
): Map<string, Commit[]> {
	const byDate = new Map<string, Commit[]>();
	for (const record of output.split(RECORD_SEPARATOR)) {
		const commit = parseRecord(record);
		if (!commit || (afterDate && commit.date <= afterDate)) continue;
		if (isIgnored(commit, ignore)) continue;
		byDate.set(commit.date, [...(byDate.get(commit.date) ?? []), commit]);
	}
	return byDate;
}

export function fetchCommitsAfter(
	ignore: string[],
	afterDate: string | null,
): Map<string, Commit[]> {
	const range = afterDate ? [`--since=${afterDate}T00:00:00`] : [];
	const output = execFileSync(
		"git",
		[
			"log",
			"--name-only",
			`--pretty=format:${RECORD_SEPARATOR}%ad|%h|%s`,
			"--date=short",
			...range,
		],
		{ encoding: "utf8", maxBuffer: 256 * 1024 * 1024 },
	);
	return parseNameOnlyLog(output, ignore, afterDate);
}
