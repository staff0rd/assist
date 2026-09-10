import { execSync } from "node:child_process";
import { getRepoInfo, isGhNotInstalled, isNotFound } from "./shared";

export function fetchPrBody(
	number: number,
	repo: { org: string; repo: string } | null,
): string {
	const { org, repo: name } = repo ?? getRepoInfo();
	try {
		const raw = execSync(`gh pr view ${number} --json body -R ${org}/${name}`, {
			encoding: "utf8",
		});
		return (JSON.parse(raw) as { body: string | null }).body ?? "";
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		if (isNotFound(error)) {
			console.error(`Error: Pull request ${org}/${name}#${number} not found.`);
			process.exit(1);
		}
		throw error;
	}
}
