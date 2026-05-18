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
		encoding: "utf-8",
	}).trim();
}

export function fetchPrDiffInfo(): PrDiffInfo {
	const { org, repo } = getRepoInfo();
	const branch = getCurrentBranch();
	const fields = "number,baseRefName,baseRefOid,headRefName,headRefOid";
	let raw: string;
	try {
		raw = execSync(`gh pr view ${branch} --json ${fields} -R ${org}/${repo}`, {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "pipe"],
		});
	} catch (error) {
		if (error instanceof Error && error.message.includes("no pull requests")) {
			console.error(
				`Error: No open pull request found for branch \`${branch}\`. Open a PR for this branch before running \`assist review\`.`,
			);
			process.exit(1);
		}
		throw error;
	}
	const parsed = JSON.parse(raw) as {
		number: number;
		baseRefName: string;
		baseRefOid: string;
		headRefName: string;
		headRefOid: string;
	};
	return {
		prNumber: parsed.number,
		baseRef: parsed.baseRefName,
		baseSha: parsed.baseRefOid,
		headRef: parsed.headRefName,
		headSha: parsed.headRefOid,
	};
}

export function fetchPrChangedFiles(prNumber: number): string[] {
	const { org, repo } = getRepoInfo();
	const out = execSync(`gh pr diff ${prNumber} --name-only -R ${org}/${repo}`, {
		encoding: "utf-8",
		maxBuffer: 64 * 1024 * 1024,
	});
	return out.trim().split("\n").filter(Boolean);
}

export function fetchPrDiff(prNumber: number): string {
	const { org, repo } = getRepoInfo();
	return execSync(`gh pr diff ${prNumber} -R ${org}/${repo}`, {
		encoding: "utf-8",
		maxBuffer: 256 * 1024 * 1024,
	});
}
