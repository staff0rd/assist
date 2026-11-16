import { execFileSync } from "node:child_process";

export function ghPrView<T>(
	prNumber: number,
	repo: { org: string; repo: string },
	fields: string,
): T {
	const raw = execFileSync(
		"gh",
		[
			"pr",
			"view",
			String(prNumber),
			"--json",
			fields,
			"-R",
			`${repo.org}/${repo.repo}`,
		],
		{ encoding: "utf8" },
	);
	return JSON.parse(raw) as T;
}
