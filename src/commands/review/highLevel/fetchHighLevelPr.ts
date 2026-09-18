import { execSync } from "node:child_process";

type HighLevelPr = {
	body: string;
	headRef: string;
	headSha: string;
};

export function fetchHighLevelPr(
	prNumber: number,
	repo: { org: string; repo: string },
): HighLevelPr {
	const raw = execSync(
		`gh pr view ${prNumber} --json body,headRefName,headRefOid -R ${repo.org}/${repo.repo}`,
		{ encoding: "utf8" },
	);
	const pr = JSON.parse(raw) as {
		body: string | null;
		headRefName: string;
		headRefOid: string;
	};
	return {
		body: pr.body ?? "",
		headRef: pr.headRefName,
		headSha: pr.headRefOid,
	};
}
