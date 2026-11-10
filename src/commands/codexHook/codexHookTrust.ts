import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { trustInstalledCodexHooks } from "../sync/trustInstalledCodexHooks";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function codexHookTrust(): Promise<void> {
	try {
		const trusted = await trustInstalledCodexHooks(
			path.join(__dirname, "..", "codex", "config.toml"),
		);
		if (trusted === undefined)
			console.log("Assist's codex-hook is not installed in Codex");
		else if (trusted)
			console.log(
				`Trusted ${trusted} assist codex-hook definition(s) in Codex`,
			);
		else
			console.log(
				"Assist's codex-hook definitions are already trusted in Codex",
			);
	} catch (error) {
		console.error(
			`Could not trust Assist's Codex hooks: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exitCode = 1;
	}
}
