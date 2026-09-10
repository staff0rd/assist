import { execSync } from "node:child_process";
import { getRepoInfo, isGhNotInstalled, isNotFound } from "./shared";

function exitGhNotInstalled(): never {
	console.error("Error: GitHub CLI (gh) is not installed.");
	console.error("Install it from https://cli.github.com/");
	process.exit(1);
}

function currentRepo(): { org: string; repo: string } {
	try {
		return getRepoInfo();
	} catch (error) {
		if (isGhNotInstalled(error)) exitGhNotInstalled();
		console.error("Error: Could not resolve the current GitHub repository.");
		console.error(
			"Pass a pull request URL, - for stdin, or a path to a file instead of a number.",
		);
		process.exit(1);
	}
}

export function fetchPrBody(
	number: number,
	repo: { org: string; repo: string } | null,
): string {
	const { org, repo: name } = repo ?? currentRepo();
	try {
		const raw = execSync(`gh pr view ${number} --json body -R ${org}/${name}`, {
			encoding: "utf8",
			stdio: ["pipe", "pipe", "pipe"],
		});
		return (JSON.parse(raw) as { body: string | null }).body ?? "";
	} catch (error) {
		if (isGhNotInstalled(error)) exitGhNotInstalled();
		if (isNotFound(error)) {
			console.error(`Error: Pull request ${org}/${name}#${number} not found.`);
			process.exit(1);
		}
		throw error;
	}
}
