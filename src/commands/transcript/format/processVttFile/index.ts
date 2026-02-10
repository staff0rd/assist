import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { deduplicateCues, parseVtt } from "../parseVtt";
import { cuesToChatMessages, formatChatLog } from "./formatChatLog";

function toMdFilename(vttFilename: string): string {
	return `${basename(vttFilename, ".vtt")
		.replace(/\s*Transcription\s*/g, " ")
		.trim()}.md`;
}

function resolveOutputDir(relativeDir: string, transcriptsDir: string): string {
	return relativeDir === "."
		? transcriptsDir
		: join(transcriptsDir, relativeDir);
}

function buildOutputPaths(
	vttFile: { filename: string; relativePath: string },
	transcriptsDir: string,
) {
	const mdFile = toMdFilename(vttFile.filename);
	const relativeDir = dirname(vttFile.relativePath);
	const outputDir = resolveOutputDir(relativeDir, transcriptsDir);
	const outputPath = join(outputDir, mdFile);
	return { outputDir, outputPath, mdFile, relativeDir };
}

function logSkipped(relativeDir: string, mdFile: string): "skipped" {
	console.log(`Skipping (already exists): ${join(relativeDir, mdFile)}`);
	return "skipped";
}

export function ensureDirectory(dir: string, label: string): void {
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
		console.log(`Created ${label}: ${dir}`);
	}
}

function processCues(content: string) {
	const cues = parseVtt(content);
	console.log(`Parsed ${cues.length} cues`);
	const dedupedCues = deduplicateCues(cues);
	console.log(`After deduplication: ${dedupedCues.length} cues`);
	return { cues, dedupedCues };
}

function convertToMessages(dedupedCues: ReturnType<typeof deduplicateCues>) {
	const chatMessages = cuesToChatMessages(dedupedCues);
	console.log(`Consolidated to ${chatMessages.length} chat messages`);
	return chatMessages;
}

function logReduction(cueCount: number, messageCount: number): void {
	console.log(`Reduction: ${cueCount} cues -> ${messageCount} messages\n`);
}

function readAndParseCues(inputPath: string) {
	console.log(`Reading: ${inputPath}`);
	return processCues(readFileSync(inputPath, "utf-8"));
}

function writeFormatted(outputPath: string, content: string): void {
	writeFileSync(outputPath, content, "utf-8");
	console.log(`Written: ${outputPath}`);
}

function convertVttToMarkdown(inputPath: string, outputPath: string): void {
	const { cues, dedupedCues } = readAndParseCues(inputPath);
	const chatMessages = convertToMessages(dedupedCues);
	writeFormatted(outputPath, formatChatLog(chatMessages));
	logReduction(cues.length, chatMessages.length);
}

function tryProcessVtt(
	vttFile: { filename: string; relativePath: string; absolutePath: string },
	paths: ReturnType<typeof buildOutputPaths>,
): "processed" | "skipped" {
	if (existsSync(paths.outputPath))
		return logSkipped(paths.relativeDir, paths.mdFile);
	convertVttToMarkdown(vttFile.absolutePath, paths.outputPath);
	return "processed";
}

export function processVttFile(
	vttFile: { filename: string; relativePath: string; absolutePath: string },
	transcriptsDir: string,
): "processed" | "skipped" {
	const paths = buildOutputPaths(vttFile, transcriptsDir);
	ensureDirectory(paths.outputDir, "output directory");
	return tryProcessVtt(vttFile, paths);
}
