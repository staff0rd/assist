import fs from "node:fs";
import type { Project } from "ts-morph";
import { isYamlFile } from "../../../shared/isYamlFile";
import { collectComments } from "./collectComments";
import { collectYamlComments } from "./collectYamlComments";
import { isCommentExempt } from "./isCommentExempt";

export type CommentFinding = {
	file: string;
	line: number;
	text: string;
};

function toSingleLine(text: string): string {
	return text.replace(/\s+/g, " ").trim();
}

export function collectFileComments(
	file: string,
	lines: Set<number>,
	project: Project,
): CommentFinding[] {
	const findings: CommentFinding[] = [];

	if (isYamlFile(file)) {
		for (const { line, text } of collectYamlComments(
			fs.readFileSync(file, "utf8"),
		)) {
			if (lines.has(line))
				findings.push({ file, line, text: toSingleLine(text) });
		}
		return findings;
	}

	const sourceFile = project.addSourceFileAtPath(file);
	for (const { pos, text } of collectComments(sourceFile)) {
		const { line } = sourceFile.getLineAndColumnAtPos(pos);
		if (!lines.has(line)) continue;
		if (isCommentExempt(text)) continue;
		findings.push({ file, line, text: toSingleLine(text) });
	}
	return findings;
}
