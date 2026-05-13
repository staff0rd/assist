import { loadProjectConfig, saveConfig } from "../../shared/loadConfig";
import { buildRunEntry } from "../run/buildRunEntry";
import type { ScriptWriterOptions } from "./installPackage";

const GLOBAL_COMMANDS = new Set(["assist", "npm", "npx", "node"]);

export function setupVerifyRunEntry(
	scriptName: string,
	command: string,
	options?: ScriptWriterOptions,
): void {
	const config = loadProjectConfig();
	if (!config.run) config.run = [];
	const runList = config.run as { name: string; quiet?: boolean }[];
	if (runList.find((r) => r.name === scriptName)) return;

	const parts = command.split(/\s+/);
	const needsNpx = !GLOBAL_COMMANDS.has(parts[0]);
	const fullCommand = needsNpx ? `npx ${command}` : command;

	const entry: { name: string; quiet?: boolean } = buildRunEntry(
		scriptName,
		fullCommand,
		[],
	);
	if (options?.quiet) entry.quiet = true;
	runList.push(entry);
	saveConfig(config);
}
