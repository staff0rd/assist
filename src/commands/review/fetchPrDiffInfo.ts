import { execSync } from "node:child_process";
import { getRepoInfo } from "../prs/shared";

type PrDiffInfo = {
	prNumber: number;
	baseRef: string;
	baseSha: string;
	headRef: string;
	headSha: string;
};

function getCurrentBranch(): string {
	return execSync("git rev-parse --abbrev-ref HEAD", {
		encoding: "utf8",
	}).trim();
}

export function fetchPrDiffInfo(): PrDiffInfo {
	const { org, repo } = getRepoInfo();
	const branch = getCurrentBranch();
	const fields = "number,baseRefName,baseRefOid,headRefName,headRefOid";
	const raw = execSync(
		`gh pr list --state open --head ${branch} --json ${fields} -R ${org}/${repo}`,
		{
			encoding: "utf8",
			stdio: ["ignore", "pipe", "pipe"],
		},
	);
	const parsed = JSON.parse(raw) as {
		number: number;
		baseRefName: string;
		baseRefOid: string;
		headRefName: string;
		headRefOid: string;
	}[];
	const pr = parsed[0];
	if (!pr) {
		console.error(
			`Error: No open pull request found for branch \`${branch}\`. Open a PR for this branch before running \`assist review\`.`,
		);
		process.exit(1);
	}
	return {
		prNumber: pr.number,
		baseRef: pr.baseRefName,
		baseSha: pr.baseRefOid,
		headRef: pr.headRefName,
		headSha: pr.headRefOid,
	};
}

export function fetchPrChangedFiles(prNumber: number): string[] {
	const { org, repo } = getRepoInfo();
	const out = execSync(
		`gh api repos/${org}/${repo}/pulls/${prNumber}/files --paginate --jq ".[].filename"`,
		{
			encoding: "utf8",
			maxBuffer: 64 * 1024 * 1024,
		},
	);
	return out.trim().split("\n").filter(Boolean);
}
