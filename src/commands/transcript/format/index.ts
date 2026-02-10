import { existsSync } from "node:fs";
import { getTranscriptConfig } from "../../../shared/loadConfig";
import { findVttFilesRecursive } from "../shared";
import { fixInvalidDatePrefixes } from "./fixInvalidDatePrefixes";
import { ensureDirectory, processVttFile } from "./processVttFile";

function logSummary(counts: { processed: number; skipped: number }): void {
	console.log(
		`\nSummary: ${counts.processed} processed, ${counts.skipped} skipped`,
	);
}

function processAllFiles(
	vttFiles: { filename: string; relativePath: string; absolutePath: string }[],
	transcriptsDir: string,
): void {
	const counts = { processed: 0, skipped: 0 };
	for (const vttFile of vttFiles) {
		counts[processVttFile(vttFile, transcriptsDir)]++;
	}
	logSummary(counts);
}

function requireVttDir(vttDir: string): void {
	if (!existsSync(vttDir)) {
		console.error(`VTT directory not found: ${vttDir}`);
		process.exit(1);
	}
}

function logFoundFiles(
	files: ReturnType<typeof findVttFilesRecursive>,
	vttDir: string,
): void {
	console.log(`Found ${files.length} VTT file(s) in ${vttDir}\n`);
}

function logNoVttFiles(): null {
	console.log("No VTT files found in vtt directory.");
	return null;
}

function loadVttFiles(vttDir: string) {
	const files = findVttFilesRecursive(vttDir);
	if (files.length === 0) return logNoVttFiles();
	logFoundFiles(files, vttDir);
	return files;
}

async function formatLoadedFiles(
	vttFiles: NonNullable<ReturnType<typeof loadVttFiles>>,
	transcriptsDir: string,
): Promise<void> {
	const fixed = await fixInvalidDatePrefixes(vttFiles);
	processAllFiles(fixed, transcriptsDir);
}

export async function format() {
	const { vttDir, transcriptsDir } = getTranscriptConfig();
	requireVttDir(vttDir);
	ensureDirectory(transcriptsDir, "output directory");
	const vttFiles = loadVttFiles(vttDir);
	if (vttFiles) await formatLoadedFiles(vttFiles, transcriptsDir);
}
