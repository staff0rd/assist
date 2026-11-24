import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import type { HighLevelFile, HighLevelFileStatus } from "./types";

type ApiFile = {
	filename: string;
	previous_filename?: string | null;
	status: string;
	additions: number;
	deletions: number;
	patch?: string;
};

const JQ =
	".[] | {filename,previous_filename,status,additions,deletions,patch} | @json";

function toStatus(status: string): HighLevelFileStatus {
	if (status === "added") return "added";
	if (status === "removed") return "removed";
	return "modified";
}

function diffUrl(repo: string, prNumber: number, path: string): string {
	const anchor = createHash("sha256").update(path).digest("hex");
	return `https://github.com/${repo}/pull/${prNumber}/files#diff-${anchor}`;
}

export function fetchHighLevelFiles(
	prNumber: number,
	repo: string,
): HighLevelFile[] {
	const out = execFileSync(
		"gh",
		["api", `repos/${repo}/pulls/${prNumber}/files`, "--paginate", "--jq", JQ],
		{ encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
	);
	return out
		.trim()
		.split("\n")
		.filter(Boolean)
		.map((line): HighLevelFile => {
			const file = JSON.parse(line) as ApiFile;
			return {
				path: file.filename,
				...(file.previous_filename
					? { previousPath: file.previous_filename }
					: {}),
				status: toStatus(file.status),
				additions: file.additions,
				deletions: file.deletions,
				diffUrl: diffUrl(repo, prNumber, file.filename),
				...(file.patch ? { patch: file.patch } : {}),
			};
		});
}
