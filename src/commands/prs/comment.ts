import { spawnSync } from "node:child_process";
import { unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { getCurrentPrNodeId, isGhNotInstalled } from "./shared";

const MUTATION = `mutation($prId: ID!, $body: String!, $path: String!, $line: Int!) { addPullRequestReviewThread(input: { pullRequestId: $prId, body: $body, path: $path, line: $line, side: RIGHT }) { thread { id } } }`;

function validateBody(body: string): void {
	const lower = body.toLowerCase();
	if (lower.includes("claude") || lower.includes("opus")) {
		console.error('Error: Body must not contain "claude" or "opus"');
		process.exit(1);
	}
}

function validateLine(line: number): void {
	if (!Number.isInteger(line) || line < 1) {
		console.error("Error: Line must be a positive integer");
		process.exit(1);
	}
}

export function comment(path: string, line: number, body: string): void {
	validateBody(body);
	validateLine(line);

	try {
		const prId = getCurrentPrNodeId();
		const queryFile = join(tmpdir(), `gh-query-${Date.now()}.graphql`);
		writeFileSync(queryFile, MUTATION);

		try {
			const result = spawnSync(
				"gh",
				[
					"api",
					"graphql",
					"-F",
					`query=@${queryFile}`,
					"-f",
					`prId=${prId}`,
					"-f",
					`body=${body}`,
					"-f",
					`path=${path}`,
					"-F",
					`line=${line}`,
				],
				{ encoding: "utf-8" },
			);
			if (result.status !== 0) {
				throw new Error(result.stderr || result.stdout);
			}
			console.log(`Added review comment on ${path}:${line}`);
		} finally {
			unlinkSync(queryFile);
		}
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		throw error;
	}
}
