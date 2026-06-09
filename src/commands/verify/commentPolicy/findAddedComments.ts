import { execSync } from "node:child_process";
import fs from "node:fs";
import { minimatch } from "minimatch";
import { Project } from "ts-morph";
import { collectComments } from "./collectComments";
import { isCommentExempt } from "./isCommentExempt";
import { parseDiffAddedLines } from "./parseDiffAddedLines";

type CommentFinding = {
	file: string;
	line: number;
	text: string;
};

type FindAddedCommentsOptions = {
	markers: string[];
	ignoreGlobs: string[];
};

const SOURCE_EXTENSIONS = [".ts", ".tsx", ".cts", ".mts", ".js", ".jsx"];

function toSingleLine(text: string): string {
	return text.replace(/\s+/g, " ").trim();
}

function shouldScan(file: string, ignoreGlobs: string[]): boolean {
	if (!SOURCE_EXTENSIONS.some((ext) => file.endsWith(ext))) return false;
	if (ignoreGlobs.some((glob) => minimatch(file, glob))) return false;
	return fs.existsSync(file);
}

export function findAddedComments(
	options: FindAddedCommentsOptions,
): CommentFinding[] {
	const diff = execSync("git diff HEAD", {
		encoding: "utf-8",
		maxBuffer: 64 * 1024 * 1024,
	});
	const addedLines = parseDiffAddedLines(diff);

	const project = new Project({
		skipAddingFilesFromTsConfig: true,
		compilerOptions: { allowJs: true },
	});

	const findings: CommentFinding[] = [];

	for (const [file, lines] of addedLines) {
		if (!shouldScan(file, options.ignoreGlobs)) continue;

		const sourceFile = project.addSourceFileAtPath(file);

		for (const { pos, text } of collectComments(sourceFile)) {
			const { line } = sourceFile.getLineAndColumnAtPos(pos);
			if (!lines.has(line)) continue;
			if (isCommentExempt(text, options.markers)) continue;
			findings.push({ file, line, text: toSingleLine(text) });
		}
	}

	findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
	return findings;
}
