import { execFileSync, spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import { iosRelevantPaths } from "./iosRelevantPaths";
import { lastUploadedTag } from "./lastUploadedTag";

function gh(args: string[]): string {
	return execFileSync("gh", args, { encoding: "utf8" });
}

function iosRunIds(): number[] {
	return JSON.parse(
		gh([
			"run",
			"list",
			"--workflow",
			"ios.yml",
			"--limit",
			"50",
			"--json",
			"databaseId",
			"-q",
			"[.[].databaseId]",
		]),
	);
}

function runJobs(runId: number): { name: string; conclusion: string | null }[] {
	return JSON.parse(
		gh(["run", "view", String(runId), "--json", "jobs", "-q", ".jobs"]),
	);
}

export async function iosChanged(): Promise<boolean> {
	const baseline = lastUploadedTag(iosRunIds(), runJobs);
	if (!baseline) {
		console.log("No prior TestFlight upload found; uploading.");
		return true;
	}
	const range = [baseline, "HEAD", "--"];
	const paths = await iosRelevantPaths();
	const { status } = spawnSync("git", ["diff", "--quiet", ...range, ...paths]);
	if (status === 0) {
		console.log(`iOS app unchanged since ${baseline}; skipping.`);
		return false;
	}
	if (status !== 1) throw new Error(`git diff exited with ${status}`);
	console.log(`iOS app changed since ${baseline}:`);
	execFileSync("git", ["diff", "--stat", ...range, ...paths], {
		stdio: "inherit",
	});
	return true;
}

const changed = await iosChanged();
if (process.env.GITHUB_OUTPUT)
	appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
