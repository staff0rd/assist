import { getConfigDir, loadConfig } from "../../shared/loadConfig";
import { resolveRunConfigs } from "../../shared/resolveRunConfigs";

export function formatConfiguredCommands(): string {
	const { run: entries } = loadConfig();
	const configs = resolveRunConfigs(entries, getConfigDir());
	if (configs.length === 0) return "\nNo configured commands";
	const names = configs.map((r) => `  ${r.name}`).join("\n");
	return `\nConfigured commands:\n${names}`;
}
