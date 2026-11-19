import { findHarnessNameViolation } from "./findHarnessNameViolation";
import { postReviewComment } from "./postReviewComment";
import { reviewProposedPrComment } from "./reviewProposedPrComment";
import { getCurrentPrNodeId, isGhNotInstalled } from "./shared";

function validateBody(body: string): void {
	const violation = findHarnessNameViolation("Body", body);
	if (violation) throw new Error(violation);
}

function validateLine(line: number): void {
	if (!Number.isInteger(line) || line < 1)
		throw new Error("Line must be a positive integer");
}

type CommentOptions = {
	startLine?: number;
	skipPreview?: boolean;
};

export async function comment(
	path: string,
	line: number,
	body: string,
	options: CommentOptions = {},
): Promise<void> {
	const { startLine, skipPreview } = options;
	validateBody(body);
	validateLine(line);
	if (startLine !== undefined) validateLine(startLine);

	const range = startLine !== undefined ? `${startLine}-${line}` : `${line}`;
	if (!skipPreview)
		await reviewProposedPrComment(`Comment on ${path}:${range}`, body, null);

	try {
		const prId = getCurrentPrNodeId();
		postReviewComment({ prId, body, path, line, startLine });
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
