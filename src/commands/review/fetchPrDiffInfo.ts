import { execFileSync, execSync } from "node:child_process";
import { currentPrSelector } from "../prs/currentPrSelector";
import { getBaseRepoInfo } from "../prs/getBaseRepoInfo";

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

function runGh(...args: string[]): string {
	return execFileSync("gh", args, {
		encoding: "utf8",
		stdio: ["ignore", "pipe", "pipe"],
	});
}

function fetchPrBySelector(repo: string, selector: string): RawPr | undefined {
	try {
		const pr = JSON.parse(
			runGh("pr", "view", selector, "--json", `${FIELDS},state`, "-R", repo),
		) as RawPr & { state: string };
		return pr.state === "OPEN" ? pr : undefined;
	} catch (error) {
		if (error instanceof Error && error.message.includes("no pull requests"))
			return undefined;
		throw error;
	}
}

function fetchRawPr(
	org: string,
	repo: string,
	branch: string,
): RawPr | undefined {
	const selector = currentPrSelector(branch, org);
	if (selector !== branch) return fetchPrBySelector(`${org}/${repo}`, selector);
	const parsed = JSON.parse(
		runGh(
			"pr",
			"list",
			"--state",
			"open",
			"--head",
			branch,
			"--json",
			FIELDS,
			"-R",
			`${org}/${repo}`,
		),
	) as RawPr[];
	return parsed[0];
}

export function fetchPrDiffInfo(): PrDiffInfo {
	const { org, repo } = getBaseRepoInfo();
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
