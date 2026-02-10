import { existsSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { getTranscriptConfig } from "../../../shared/loadConfig";
import { findMdFilesRecursive, getTranscriptBaseName } from "../shared";
import { processStagedFile, STAGING_DIR } from "./processStagedFile";

function buildRelativeKey(relativePath: string, baseName: string): string {
	const relDir = dirname(relativePath);
	return relDir === "." ? baseName : join(relDir, baseName);
}

function buildSummaryIndex(summaryDir: string): Set<string> {
	const summaryFiles = findMdFilesRecursive(summaryDir);
	return new Set(
		summaryFiles.map((f) =>
			buildRelativeKey(f.relativePath, basename(f.filename, ".md")),
		),
	);
}

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

	const summaryIndex = buildSummaryIndex(summaryDir);
	const missing = transcriptFiles.filter(
		(t) =>
			!summaryIndex.has(
				buildRelativeKey(t.relativePath, getTranscriptBaseName(t.filename)),
			),
	);

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
