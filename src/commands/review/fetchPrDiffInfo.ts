import { execSync } from "node:child_process";
import { getPinnedPr } from "../prs/pinCurrentPr";
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

type RawPr = {
	number: number;
	baseRefName: string;
	baseRefOid: string;
	headRefName: string;
	headRefOid: string;
};

const FIELDS = "number,baseRefName,baseRefOid,headRefName,headRefOid";

function runGh(command: string): string {
	return execSync(command, {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function fetchRawPr(
	org: string,
	repo: string,
	branch: string,
): RawPr | undefined {
	const pinned = getPinnedPr();
	if (pinned !== undefined)
		return JSON.parse(
			runGh(`gh pr view ${pinned} --json ${FIELDS} -R ${org}/${repo}`),
		);
	const parsed = JSON.parse(
		runGh(
			`gh pr list --state open --head ${branch} --json ${FIELDS} -R ${org}/${repo}`,
		),
	) as RawPr[];
	return parsed[0];
}

export function fetchPrDiffInfo(): PrDiffInfo {
	const { org, repo } = getRepoInfo();
	const branch = getCurrentBranch();
	const pr = fetchRawPr(org, repo, branch);
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
