import { spawnSync } from "node:child_process";
import { checkCliAvailable } from "../../shared/checkCliAvailable";
import { promptConfirm } from "../../shared/promptConfirm";

type CodexAvailability = "available" | "skipped";

function runNpmInstall(): boolean {
	const result = spawnSync("npm", ["install", "-g", "@openai/codex"], {
		stdio: "inherit",
		shell: true,
	});
	return result.status === 0 && result.error === undefined;
}

export async function ensureCodexAvailable(): Promise<CodexAvailability> {
	if (checkCliAvailable("codex")) return "available";
	console.log("codex CLI was not found on PATH.");
	const install = await promptConfirm(
		"Install @openai/codex globally via npm install -g @openai/codex?",
		true,
	);
	if (!install) {
		console.log("Skipping codex reviewer.");
		return "skipped";
	}
	console.log("Installing @openai/codex...");
	if (!runNpmInstall()) {
		console.error(
			"npm install -g @openai/codex failed. Skipping codex reviewer.",
		);
		return "skipped";
	}
	if (checkCliAvailable("codex")) return "available";
	console.error(
		"codex still not found on PATH after install. Skipping codex reviewer.",
	);
	return "skipped";
}
