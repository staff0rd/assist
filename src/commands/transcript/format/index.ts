import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { getTranscriptConfig } from "../../../shared/loadConfig";
import { findVttFilesRecursive } from "../shared";
import { fixInvalidDatePrefixes } from "./fixInvalidDatePrefixes";
import { cuesToChatMessages, formatChatLog } from "./formatChatLog";
import { deduplicateCues, parseVtt } from "./parseVtt";

function processFile(inputPath: string, outputPath: string): void {
	console.log(`Reading: ${inputPath}`);
	const content = readFileSync(inputPath, "utf-8");

	const cues = parseVtt(content);
	console.log(`Parsed ${cues.length} cues`);

	const dedupedCues = deduplicateCues(cues);
	console.log(`After deduplication: ${dedupedCues.length} cues`);

	const chatMessages = cuesToChatMessages(dedupedCues);
	console.log(`Consolidated to ${chatMessages.length} chat messages`);

	const output = formatChatLog(chatMessages);
	writeFileSync(outputPath, output, "utf-8");
	console.log(`Written: ${outputPath}`);

	console.log(
		`Reduction: ${cues.length} cues -> ${chatMessages.length} messages\n`,
	);
}

export async function format() {
	const { vttDir, transcriptsDir } = getTranscriptConfig();

	if (!existsSync(vttDir)) {
		console.error(`VTT directory not found: ${vttDir}`);
		process.exit(1);
	}

	if (!existsSync(transcriptsDir)) {
		mkdirSync(transcriptsDir, { recursive: true });
		console.log(`Created output directory: ${transcriptsDir}`);
	}

	let vttFiles = findVttFilesRecursive(vttDir);

	if (vttFiles.length === 0) {
		console.log("No VTT files found in vtt directory.");
		return;
	}

	console.log(`Found ${vttFiles.length} VTT file(s) in ${vttDir}\n`);

	vttFiles = await fixInvalidDatePrefixes(vttFiles);

	let processed = 0;
	let skipped = 0;

	for (const vttFile of vttFiles) {
		let baseName = basename(vttFile.filename, ".vtt");
		baseName = baseName.replace(/\s*Transcription\s*/g, " ").trim();
		const mdFile = `${baseName}.md`;
		const relativeDir = dirname(vttFile.relativePath);
		const outputDir =
			relativeDir === "." ? transcriptsDir : join(transcriptsDir, relativeDir);
		const outputPath = join(outputDir, mdFile);

		if (!existsSync(outputDir)) {
			mkdirSync(outputDir, { recursive: true });
			console.log(`Created output directory: ${outputDir}`);
		}

		if (existsSync(outputPath)) {
			console.log(`Skipping (already exists): ${join(relativeDir, mdFile)}`);
			skipped++;
			continue;
		}

		processFile(vttFile.absolutePath, outputPath);
		processed++;
	}

	console.log(`\nSummary: ${processed} processed, ${skipped} skipped`);
}
