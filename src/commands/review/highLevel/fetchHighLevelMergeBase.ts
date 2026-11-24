import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { ghFailure } from "../../../shared/ghFailure";

const execFileAsync = promisify(execFile);

async function ghApi(endpoint: string, jq: string): Promise<string> {
	const { stdout } = await execFileAsync("gh", ["api", endpoint, "--jq", jq], {
		encoding: "utf8",
		windowsHide: true,
		maxBuffer: 64 * 1024 * 1024,
	});
	return stdout.trim();
}

export async function fetchHighLevelMergeBase(
	repo: string,
	prNumber: number,
	headSha: string,
): Promise<string> {
	try {
		const baseSha = await ghApi(`repos/${repo}/pulls/${prNumber}`, ".base.sha");
		return await ghApi(
			`repos/${repo}/compare/${baseSha}...${headSha}`,
			".merge_base_commit.sha",
		);
	} catch (error) {
		throw new Error(
			`Could not find the merge-base of PR #${prNumber}: ${ghFailure(error)}`,
		);
	}
}
