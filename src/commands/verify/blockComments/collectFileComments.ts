import fs from "node:fs";
import type { Project } from "ts-morph";
import {
	isDockerfile,
	isEnvFile,
	isShellFile,
} from "../../../shared/isHashCommentFile";
import { isYamlFile } from "../../../shared/isYamlFile";
import type { CommentFinding } from "./types";
import { collectHashComments } from "./collectHashComments";
import { collectSourceFindings } from "./collectSourceFindings";
import { collectYamlComments } from "./collectYamlComments";
import { isCommentExempt } from "./isCommentExempt";

export type { CommentFinding } from "./types";

function toFindings(
	file: string,
	lines: Set<number>,
	raw: { line: number; text: string }[],
	exempt: boolean,
): CommentFinding[] {
	const findings: CommentFinding[] = [];
	for (const { line, text } of raw) {
		if (!lines.has(line)) continue;
		if (exempt && isCommentExempt(text)) continue;
		findings.push({ file, line, text: text.replace(/\s+/g, " ").trim() });
	}
	return findings;
}

export function collectFileComments(
	file: string,
	lines: Set<number>,
	project: Project,
): CommentFinding[] {
	const read = () => fs.readFileSync(file, "utf8");

	if (isYamlFile(file))
		return toFindings(file, lines, collectYamlComments(read()), false);

	if (isDockerfile(file) || isEnvFile(file) || isShellFile(file))
		return toFindings(
			file,
			lines,
			collectHashComments(read(), { skipHeader: isShellFile(file) }),
			true,
		);

	return collectSourceFindings(file, lines, project);
}
