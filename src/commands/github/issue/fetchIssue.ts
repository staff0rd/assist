import { execFileSync } from "node:child_process";

type FetchedIssue = {
	title: string;
	body: string;
	updatedAt: string;
	url: string;
	parent?: { number: number; url: string } | null;
};

export function fetchIssue(
	number: number,
	repo: string | undefined,
	withParent = false,
): FetchedIssue {
	const args = [
		"issue",
		"view",
		String(number),
		"--json",
		withParent ? "title,body,updatedAt,url,parent" : "title,body,updatedAt,url",
	];
	if (repo) args.push("--repo", repo);

	let raw: string;
	try {
		raw = execFileSync("gh", args, { encoding: "utf8" });
	} catch {
		console.error(`Could not fetch issue #${number} with gh issue view`);
		process.exit(1);
	}

	try {
		return JSON.parse(raw) as FetchedIssue;
	} catch {
		console.error(`Could not parse the gh issue view output for #${number}`);
		process.exit(1);
	}
}
