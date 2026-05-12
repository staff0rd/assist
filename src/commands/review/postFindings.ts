import { comment } from "../prs/comment";
import type { LineBoundFinding } from "./partitionFindings";
import { sanitiseReviewerNames } from "./sanitiseReviewerNames";

export function buildCommentBody(finding: LineBoundFinding): string {
	const lines: string[] = [];
	const severityLabel = finding.severity ?? "finding";
	lines.push(`**${severityLabel}: ${finding.title}**`);
	if (finding.impact) lines.push("", `Impact: ${finding.impact}`);
	if (finding.recommendation)
		lines.push("", `Recommendation: ${finding.recommendation}`);
	return sanitiseReviewerNames(lines.join("\n"));
}

type PostFindingsResult = {
	posted: number;
	failed: number;
};

export function postFindings(findings: LineBoundFinding[]): PostFindingsResult {
	let posted = 0;
	let failed = 0;
	for (const finding of findings) {
		const body = buildCommentBody(finding);
		try {
			comment(finding.file, finding.line, body, finding.startLine);
			posted++;
		} catch (error) {
			failed++;
			const message = error instanceof Error ? error.message : String(error);
			console.error(
				`Failed to post comment on ${finding.file}:${finding.line}: ${message}`,
			);
		}
	}
	return { posted, failed };
}
