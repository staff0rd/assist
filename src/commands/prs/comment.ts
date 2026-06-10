import { runGhGraphql } from "../../shared/runGhGraphql";
import { getCurrentPrNodeId, isGhNotInstalled } from "./shared";

const MUTATION_SINGLE = `mutation($prId: ID!, $body: String!, $path: String!, $line: Int!) { addPullRequestReviewThread(input: { pullRequestId: $prId, body: $body, path: $path, line: $line, side: RIGHT }) { thread { id } } }`;

const MUTATION_MULTI = `mutation($prId: ID!, $body: String!, $path: String!, $line: Int!, $startLine: Int!) { addPullRequestReviewThread(input: { pullRequestId: $prId, body: $body, path: $path, line: $line, startLine: $startLine, side: RIGHT, startSide: RIGHT }) { thread { id } } }`;

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

type CommentVars = {
	prId: string;
	body: string;
	path: string;
	line: number;
	startLine?: number;
};

function assertThreadCreated(stdout: string): void {
	let parsed: {
		data?: { addPullRequestReviewThread?: { thread?: { id?: unknown } } };
	};
	try {
		parsed = JSON.parse(stdout);
	} catch {
		throw new Error(`GitHub returned an unparseable response: ${stdout}`);
	}
	const id = parsed.data?.addPullRequestReviewThread?.thread?.id;
	if (typeof id !== "string" || id.length === 0) {
		throw new Error(
			"GitHub did not create a review thread (no thread id returned); the line is likely outside the PR diff.",
		);
	}
}

function postComment(vars: CommentVars): void {
	const { startLine, ...base } = vars;
	const stdout =
		startLine === undefined
			? runGhGraphql(MUTATION_SINGLE, base)
			: runGhGraphql(MUTATION_MULTI, { ...base, startLine });
	assertThreadCreated(stdout);
}

export function comment(
	path: string,
	line: number,
	body: string,
	startLine?: number,
): void {
	validateBody(body);
	validateLine(line);
	if (startLine !== undefined) validateLine(startLine);
	try {
		const prId = getCurrentPrNodeId();
		postComment({ prId, body, path, line, startLine });
		const range = startLine !== undefined ? `${startLine}-${line}` : `${line}`;
		console.log(`Added review comment on ${path}:${range}`);
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		throw error;
	}
}
