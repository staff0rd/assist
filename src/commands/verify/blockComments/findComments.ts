import { execSync } from "node:child_process";
import fs from "node:fs";
import { minimatch } from "minimatch";
import { Project } from "ts-morph";
import { isHashCommentFile } from "../../../shared/isHashCommentFile";
import {
	type CommentFinding,
	collectFileComments,
} from "./collectFileComments";
import { parseDiffAddedLines } from "./parseDiffAddedLines";

type FindCommentsOptions = {
	ignoreGlobs: string[];
};

const SCANNED_EXTENSIONS = [
	".ts",
	".tsx",
	".cts",
	".mts",
	".js",
	".jsx",
	".yml",
	".yaml",
];

function shouldScan(file: string, ignoreGlobs: string[]): boolean {
	if (
		!SCANNED_EXTENSIONS.some((ext) => file.endsWith(ext)) &&
		!isHashCommentFile(file)
	)
		return false;
	if (ignoreGlobs.some((glob) => minimatch(file, glob))) return false;
	return fs.existsSync(file);
}

export function findComments(options: FindCommentsOptions): CommentFinding[] {
	const diff = execSync("git diff HEAD", {
		encoding: "utf8",
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
		findings.push(...collectFileComments(file, lines, project));
	}

	findings.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
	return findings;
}
