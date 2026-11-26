import { execFileSync } from "node:child_process";
import { getBaseRepoInfo } from "../prs/getBaseRepoInfo";

export function fetchPrChangedFiles(prNumber: number): string[] {
	const { org, repo } = getBaseRepoInfo();
	const out = execFileSync(
		"gh",
		[
			"api",
			`repos/${org}/${repo}/pulls/${prNumber}/files`,
			"--paginate",
			"--jq",
			".[].filename",
		],
		{
			encoding: "utf8",
			maxBuffer: 64 * 1024 * 1024,
		},
	);
	return out.trim().split("\n").filter(Boolean);
}
