import type { detectVscodeSetup } from "./detectVscodeSetup";

export type ConfigOption = {
	name: string;
	value: string;
	description: string;
};

function getLaunchDescription(
	setup: ReturnType<typeof detectVscodeSetup>,
): string | undefined {
	if (setup.hasLaunchJson) return undefined;
	if (setup.hasVite) return "Debug configuration for Vite dev server";
	if (setup.hasTsup) return "Debug configuration for Node.js CLI";
	return undefined;
}

export function getAvailableOptions(
	setup: ReturnType<typeof detectVscodeSetup>,
): ConfigOption[] {
	const options: ConfigOption[] = [];
	const launchDescription = getLaunchDescription(setup);
	if (launchDescription)
		options.push({
			name: "launch",
			value: "launch",
			description: launchDescription,
		});
	if (!setup.hasSettingsJson)
		options.push({
			name: "settings",
			value: "settings",
			description: "Biome formatter configuration",
		});
	return options;
}
