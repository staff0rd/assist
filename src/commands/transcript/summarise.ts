import { existsSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { getTranscriptConfig } from "../../shared/loadConfig";
import { findMdFilesRecursive, getTranscriptBaseName } from "./shared";

export function summarise() {
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

	console.log(`Missing summaries (${missing.length}):\n`);
	for (const file of missing) {
		console.log(`  - ${file.absolutePath}`);
	}
}
