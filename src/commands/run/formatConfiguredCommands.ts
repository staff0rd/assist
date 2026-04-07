import { loadConfig } from "../../shared/loadConfig";

export function formatConfiguredCommands(): string {
	const { run: configs } = loadConfig();
	if (!configs || configs.length === 0) return "\nNo configured commands";
	const names = configs.map((r) => `  ${r.name}`).join("\n");
	return `\nConfigured commands:\n${names}`;
}
