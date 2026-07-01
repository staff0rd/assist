import {
	existsSync,
	mkdirSync,
	readFileSync,
	renameSync,
	writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";
import { getTranscriptConfig } from "../../shared/loadConfig";
import { cuesToChatMessages, formatChatLog } from "./convert/formatChatLog";
import { deduplicateCues, parseVtt } from "./convert/parseVtt";

type MoveOptions = {
	date: string;
	client: string;
};

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function convertVttToMarkdown(inputPath: string): string {
	const cues = parseVtt(readFileSync(inputPath, "utf8"));
	const messages = cuesToChatMessages(deduplicateCues(cues));
	return formatChatLog(messages);
}

function archiveRawVtt(
	vttDir: string,
	sourcePath: string,
	filename: string,
): void {
	const processedDir = join(vttDir, "processed");
	mkdirSync(processedDir, { recursive: true });
	renameSync(sourcePath, join(processedDir, filename));
}

export function move(file: string, options: MoveOptions): void {
	const { date, client } = options;
	if (!DATE_REGEX.test(date)) {
		console.error("Error: --date must be in YYYY-MM-DD format.");
		process.exit(1);
	}
	const { vttDir, transcriptsDir, summaryDir } = getTranscriptConfig();

	const filename = basename(file);
	const sourcePath = join(vttDir, filename);
	if (!existsSync(sourcePath)) {
		console.error(`Error: VTT file not found: ${sourcePath}`);
		process.exit(1);
	}

	const base = basename(filename, ".vtt").replace(/ Transcription$/, "");
	const outputName = `${date} ${base}.md`;

	const formattedDir = join(transcriptsDir, client);
	mkdirSync(formattedDir, { recursive: true });
	const formattedPath = join(formattedDir, outputName);
	writeFileSync(formattedPath, convertVttToMarkdown(sourcePath), "utf8");

	archiveRawVtt(vttDir, sourcePath, filename);

	const summaryPath = join(summaryDir, client, outputName);
	console.log(`Formatted transcript: ${formattedPath}`);
	console.log(`Summary target:       ${summaryPath}`);
}
