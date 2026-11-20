import { exitNoRunConfigs, requireRunConfigs } from "./findRunConfig";
import { formatRunEntry } from "./formatRunEntry";
import { loadSourcedRunConfigs } from "./loadSourcedRunConfigs";

type ListRunOptions = { verbose?: boolean; json?: boolean };

export function listRunConfigs({ verbose, json }: ListRunOptions): void {
	if (json) {
		const sourced = loadSourcedRunConfigs(process.cwd());
		const entries = sourced.map(({ config, source }) => ({
			...config,
			source,
		}));
		console.log(JSON.stringify(entries, null, 2));
		return;
	}
	if (!verbose) {
		for (const config of requireRunConfigs()) console.log(config.name);
		return;
	}
	const sourced = loadSourcedRunConfigs(process.cwd());
	if (sourced.length === 0) exitNoRunConfigs();
	for (const { config, source } of sourced)
		console.log(formatRunEntry(config, source));
}
