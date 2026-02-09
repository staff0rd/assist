import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import chalk from "chalk";
import { getTranscriptConfig } from "../../../shared/loadConfig";
import { findMdFilesRecursive, getTranscriptBaseName } from "../shared";

export const STAGING_DIR = join(process.cwd(), ".assist", "transcript");
const FULL_TRANSCRIPT_REGEX = /^\[Full Transcript\]\(([^)]+)\)/;

export function processStagedFile(): boolean {
	if (!existsSync(STAGING_DIR)) {
		return false;
	}

	const stagedFiles = findMdFilesRecursive(STAGING_DIR);
	if (stagedFiles.length === 0) {
		return false;
	}

	const { transcriptsDir, summaryDir } = getTranscriptConfig();
	const stagedFile = stagedFiles[0];
	const content = readFileSync(stagedFile.absolutePath, "utf-8");
	const firstLine = content.split("\n")[0];

	const match = firstLine.match(FULL_TRANSCRIPT_REGEX);
	if (!match) {
		console.error(
			chalk.red(
				`Staged file ${stagedFile.filename} missing [Full Transcript](<path>) link on first line.`,
			),
		);
		process.exit(1);
	}

	const contentAfterLink = content.slice(firstLine.length).trim();
	if (!contentAfterLink) {
		console.error(
			chalk.red(
				`Staged file ${stagedFile.filename} has no summary content after the transcript link.`,
			),
		);
		process.exit(1);
	}

	// Find transcript by matching basename
	const stagedBaseName = getTranscriptBaseName(stagedFile.filename);
	const transcriptFiles = findMdFilesRecursive(transcriptsDir);
	const matchingTranscript = transcriptFiles.find(
		(t) => getTranscriptBaseName(t.filename) === stagedBaseName,
	);

	if (!matchingTranscript) {
		console.error(
			chalk.red(
				`No transcript found matching staged file: ${stagedFile.filename}`,
			),
		);
		process.exit(1);
	}

	const relativePath = matchingTranscript.relativePath;

	const destPath = join(summaryDir, relativePath);
	const destDir = dirname(destPath);

	if (!existsSync(destDir)) {
		mkdirSync(destDir, { recursive: true });
	}

	renameSync(stagedFile.absolutePath, destPath);

	// Clean up staging dir if empty
	const remaining = findMdFilesRecursive(STAGING_DIR);
	if (remaining.length === 0) {
		rmSync(STAGING_DIR, { recursive: true });
	}

	return true;
}
