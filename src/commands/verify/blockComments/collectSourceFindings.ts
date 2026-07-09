import type { Project } from "ts-morph";
import { collectComments } from "./collectComments";
import type { CommentFinding } from "./types";
import { isCommentExempt } from "./isCommentExempt";

function toSingleLine(text: string): string {
	return text.replace(/\s+/g, " ").trim();
}

export function collectSourceFindings(
	file: string,
	lines: Set<number>,
	project: Project,
): CommentFinding[] {
	const findings: CommentFinding[] = [];
	const sourceFile = project.addSourceFileAtPath(file);
	for (const { pos, text } of collectComments(sourceFile)) {
		const { line } = sourceFile.getLineAndColumnAtPos(pos);
		if (!lines.has(line)) continue;
		if (isCommentExempt(text)) continue;
		findings.push({ file, line, text: toSingleLine(text) });
	}
	return findings;
}
