import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	rmSync,
} from "node:fs";
import { basename, dirname, join, relative, resolve } from "node:path";
import chalk from "chalk";
import { getTranscriptConfig } from "../../shared/loadConfig";
import { findMdFilesRecursive, getTranscriptBaseName } from "./shared";

const STAGING_DIR = join(process.cwd(), ".assist", "transcript");
const FULL_TRANSCRIPT_REGEX = /^\[Full Transcript\]\(([^)]+)\)/;

function processStagedFile(): boolean {
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

	const transcriptPath = resolve(process.cwd(), match[1]);
	const contentAfterLink = content.slice(firstLine.length).trim();
	if (!contentAfterLink) {
		console.error(
			chalk.red(
				`Staged file ${stagedFile.filename} has no summary content after the transcript link.`,
			),
		);
		process.exit(1);
	}

	const relativePath = relative(transcriptsDir, transcriptPath);
	if (relativePath.startsWith("..")) {
		console.error(
			chalk.red(
				`Transcript path ${transcriptPath} is not within configured transcripts directory.`,
			),
		);
		process.exit(1);
	}

	const destPath = join(summaryDir, relativePath);
	const destDir = dirname(destPath);

	if (!existsSync(destDir)) {
		mkdirSync(destDir, { recursive: true });
	}

	renameSync(stagedFile.absolutePath, destPath);
	console.log(chalk.green(`Moved summary to: ${destPath}`));

	// Clean up staging dir if empty
	const remaining = findMdFilesRecursive(STAGING_DIR);
	if (remaining.length === 0) {
		rmSync(STAGING_DIR, { recursive: true });
	}

	return true;
}

export function summarise() {
	// First check for staged files to process
	if (processStagedFile()) {
		return;
	}

	const { transcriptsDir, summaryDir } = getTranscriptConfig();

	if (!existsSync(transcriptsDir)) {
		console.log("No transcripts directory found.");
		return;
	}

	const transcriptFiles = findMdFilesRecursive(transcriptsDir);

	if (transcriptFiles.length === 0) {
		console.log("No transcript files found.");
		return;
	}

	const summaryFiles = findMdFilesRecursive(summaryDir);
	const summaryRelativePaths = new Set(
		summaryFiles.map((f) => {
			const relDir = dirname(f.relativePath);
			const baseName = basename(f.filename, ".md");
			return relDir === "." ? baseName : join(relDir, baseName);
		}),
	);

	const missing: typeof transcriptFiles = [];
	for (const transcript of transcriptFiles) {
		const transcriptBaseName = getTranscriptBaseName(transcript.filename);
		const relDir = dirname(transcript.relativePath);
		const fullKey =
			relDir === "." ? transcriptBaseName : join(relDir, transcriptBaseName);

		if (!summaryRelativePaths.has(fullKey)) {
			missing.push(transcript);
		}
	}

	if (missing.length === 0) {
		console.log("All transcripts have summaries.");
		return;
	}

	// Only show the first missing transcript
	const next = missing[0];
	const outputFilename = `${getTranscriptBaseName(next.filename)}.md`;
	const outputPath = join(STAGING_DIR, outputFilename);
	const relativeTranscriptPath = relative(process.cwd(), next.absolutePath);

	console.log(`Missing summaries: ${missing.length}\n`);
	console.log("Read and summarise this transcript:");
	console.log(`   ${next.absolutePath}\n`);
	console.log("Write the summary to:");
	console.log(`   ${outputPath}\n`);
	console.log("The summary must start with:");
	console.log(`   [Full Transcript](${relativeTranscriptPath})`);
}
