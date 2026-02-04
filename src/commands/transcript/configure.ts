import { loadConfig, saveConfig } from "../../shared/loadConfig";
import { askQuestion, createReadlineInterface } from "./shared";

export async function configure(): Promise<void> {
	const rl = createReadlineInterface();
	const config = loadConfig();

	console.log("Configure transcript directories\n");

	if (config.transcript) {
		console.log("Current configuration:");
		console.log(`  VTT directory:         ${config.transcript.vttDir}`);
		console.log(`  Transcripts directory: ${config.transcript.transcriptsDir}`);
		console.log(`  Summary directory:     ${config.transcript.summaryDir}`);
		console.log();
	}

	try {
		const vttDir = await askQuestion(
			rl,
			`VTT directory${config.transcript?.vttDir ? ` [${config.transcript.vttDir}]` : ""}: `,
		);
		const transcriptsDir = await askQuestion(
			rl,
			`Transcripts directory${config.transcript?.transcriptsDir ? ` [${config.transcript.transcriptsDir}]` : ""}: `,
		);
		const summaryDir = await askQuestion(
			rl,
			`Summary directory${config.transcript?.summaryDir ? ` [${config.transcript.summaryDir}]` : ""}: `,
		);

		rl.close();

		const newConfig = {
			...config,
			transcript: {
				vttDir: vttDir || config.transcript?.vttDir || "",
				transcriptsDir:
					transcriptsDir || config.transcript?.transcriptsDir || "",
				summaryDir: summaryDir || config.transcript?.summaryDir || "",
			},
		};

		if (
			!newConfig.transcript.vttDir ||
			!newConfig.transcript.transcriptsDir ||
			!newConfig.transcript.summaryDir
		) {
			console.error("\nError: All directories must be specified.");
			process.exit(1);
		}

		saveConfig(newConfig);
		console.log("\nConfiguration saved.");
	} catch (error) {
		rl.close();
		throw error;
	}
}
