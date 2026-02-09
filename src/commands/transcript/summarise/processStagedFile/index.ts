import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { getTranscriptConfig } from "../../../../shared/loadConfig";
import { findMdFilesRecursive, getTranscriptBaseName } from "../../shared";
import { validateStagedContent } from "./validateStagedContent";

export const STAGING_DIR = join(process.cwd(), ".assist", "transcript");

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

	validateStagedContent(stagedFile.filename, content);

	const stagedBaseName = getTranscriptBaseName(stagedFile.filename);
	const transcriptFiles = findMdFilesRecursive(transcriptsDir);
	const matchingTranscript = transcriptFiles.find(
		(t) => getTranscriptBaseName(t.filename) === stagedBaseName,
	);

	if (!matchingTranscript) {
		console.error(
			`No transcript found matching staged file: ${stagedFile.filename}`,
		);
		process.exit(1);
	}

	const destPath = join(summaryDir, matchingTranscript.relativePath);
	const destDir = dirname(destPath);

	if (!existsSync(destDir)) {
		mkdirSync(destDir, { recursive: true });
	}

	renameSync(stagedFile.absolutePath, destPath);

	const remaining = findMdFilesRecursive(STAGING_DIR);
	if (remaining.length === 0) {
		rmSync(STAGING_DIR, { recursive: true });
	}

	return true;
}
