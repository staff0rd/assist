import { spawnSync } from "node:child_process";
import { checkCliAvailable } from "../checkCliAvailable";
import { harnesses } from "../harnesses";
import { promptConfirm } from "../promptConfirm";

function runNpmInstall(): boolean {
	const result = spawnSync("npm", ["install", "-g", "@openai/codex"], {
		stdio: "inherit",
		shell: true,
	});
	return result.status === 0 && result.error === undefined;
}

export async function offerCodexInstall(): Promise<boolean> {
	const { command } = harnesses.codex;
	console.log(`${command} CLI was not found on PATH.`);
	const install = await promptConfirm(
		"Install @openai/codex globally via npm install -g @openai/codex?",
		true,
	);
	if (!install) return false;
	console.log("Installing @openai/codex...");
	if (!runNpmInstall()) {
		console.error("npm install -g @openai/codex failed.");
		return false;
	}
	if (checkCliAvailable(command)) return true;
	console.error(`${command} still not found on PATH after install.`);
	return false;
}
