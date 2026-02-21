import type { Interface as ReadlineInterface } from "node:readline";
import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";
import { askQuestion, createReadlineInterface } from "./shared";

type TranscriptDirs = {
	vttDir: string;
	transcriptsDir: string;
	summaryDir: string;
};

function buildPrompt(label: string, current?: string): string {
	return current ? `${label} [${current}]: ` : `${label}: `;
}

function printExisting(existing: TranscriptDirs): void {
	console.log("Current configuration:");
	console.log(`  VTT directory:         ${existing.vttDir}`);
	console.log(`  Transcripts directory: ${existing.transcriptsDir}`);
	console.log(`  Summary directory:     ${existing.summaryDir}`);
	console.log();
}

async function promptDirectories(
	rl: ReadlineInterface,
	existing?: TranscriptDirs,
): Promise<TranscriptDirs> {
	const vttDir = await askQuestion(
		rl,
		buildPrompt("VTT directory", existing?.vttDir),
	);
	const transcriptsDir = await askQuestion(
		rl,
		buildPrompt("Transcripts directory", existing?.transcriptsDir),
	);
	const summaryDir = await askQuestion(
		rl,
		buildPrompt("Summary directory", existing?.summaryDir),
	);
	return {
		vttDir: vttDir || existing?.vttDir || "",
		transcriptsDir: transcriptsDir || existing?.transcriptsDir || "",
		summaryDir: summaryDir || existing?.summaryDir || "",
	};
}

function validateDirectories(transcript: TranscriptDirs): void {
	if (
		!transcript.vttDir ||
		!transcript.transcriptsDir ||
		!transcript.summaryDir
	) {
		console.error("\nError: All directories must be specified.");
		process.exit(1);
	}
}

export async function configure(): Promise<void> {
	const rl = createReadlineInterface();
	const config = loadProjectConfig();
	const existing = config.transcript as TranscriptDirs | undefined;

	console.log("Configure transcript directories\n");
	if (existing) printExisting(existing);

	try {
		const transcript = await promptDirectories(rl, existing);
		rl.close();
		validateDirectories(transcript);
		saveConfig({ ...config, transcript });
		console.log("\nConfiguration saved.");
	} catch (error) {
		rl.close();
		throw error;
	}
}
