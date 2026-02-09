import { existsSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { getTranscriptConfig } from "../../shared/loadConfig";
import { processStagedFile, STAGING_DIR } from "./processStagedFile";
import { findMdFilesRecursive, getTranscriptBaseName } from "./shared";

export function summarise() {
	// First check for staged files to process
	processStagedFile();

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
	const summaryFileDir = join(summaryDir, dirname(next.relativePath));
	const relativeTranscriptPath = encodeURI(
		relative(summaryFileDir, next.absolutePath).replace(/\\/g, "/"),
	);

	console.log(`Missing summaries: ${missing.length}\n`);
	console.log("Read and summarise this transcript:");
	console.log(`   ${next.absolutePath}\n`);
	console.log("Write the summary to:");
	console.log(`   ${outputPath}\n`);
	console.log("The summary must start with:");
	console.log(`   [Full Transcript](${relativeTranscriptPath})`);
}
