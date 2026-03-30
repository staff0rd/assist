import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";
import { buildRunEntry } from "../run/buildRunEntry";

const GLOBAL_COMMANDS = new Set(["assist", "npm", "npx", "node"]);

export function setupVerifyRunEntry(scriptName: string, command: string): void {
	const config = loadProjectConfig();
	if (!config.run) config.run = [];
	const runList = config.run as { name: string }[];
	if (runList.find((r) => r.name === scriptName)) return;

	const parts = command.split(/\s+/);
	const needsNpx = !GLOBAL_COMMANDS.has(parts[0]);
	const fullCommand = needsNpx ? `npx ${command}` : command;

	runList.push(buildRunEntry(scriptName, fullCommand, []));
	saveConfig(config);
}
