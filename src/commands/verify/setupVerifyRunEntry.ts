import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";

type RunEntry = { name: string; command: string; args?: string[] };

const GLOBAL_COMMANDS = new Set(["assist", "npm", "npx", "node"]);

function buildRunEntry(scriptName: string, command: string): RunEntry {
	const parts = command.split(/\s+/);
	const needsNpx = !GLOBAL_COMMANDS.has(parts[0]);
	const entry: RunEntry = {
		name: scriptName,
		command: needsNpx ? "npx" : parts[0],
	};
	const args = needsNpx ? parts : parts.slice(1);
	if (args.length > 0) entry.args = args;
	return entry;
}

export function setupVerifyRunEntry(scriptName: string, command: string): void {
	const config = loadProjectConfig();
	if (!config.run) config.run = [];
	const runList = config.run as RunEntry[];
	if (runList.find((r) => r.name === scriptName)) return;
	runList.push(buildRunEntry(scriptName, command));
	saveConfig(config);
}
