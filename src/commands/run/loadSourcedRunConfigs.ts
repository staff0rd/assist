import { assertNoDuplicateRunNames } from "../../shared/assertNoDuplicateRunNames";
import {
	getGlobalConfigPath,
	loadConfigFrom,
	projectConfigPathFrom,
} from "../../shared/loadConfigFrom";
import { loadRawConfigLayers } from "../../shared/loadRawConfigLayers";
import { resolveRunConfigs } from "../../shared/resolveRunConfigs";
import { runConfigBaseDirFrom } from "../../shared/runConfigBaseDir";
import type { SourcedRunConfig } from "./RunEntrySource";
import { runEntrySourceOf } from "./runEntrySourceOf";

export function loadSourcedRunConfigs(
	cwd: string,
	globalConfigPath: string = getGlobalConfigPath(),
): SourcedRunConfig[] {
	const { run: entries = [] } = loadConfigFrom(cwd, globalConfigPath);
	const layers = loadRawConfigLayers(
		cwd,
		globalConfigPath,
		projectConfigPathFrom(cwd),
	);
	const baseDir = runConfigBaseDirFrom(cwd);
	const sourced = entries.flatMap((entry) => {
		const source = runEntrySourceOf(entry, layers);
		return resolveRunConfigs([entry], baseDir).map((config) => ({
			config,
			source,
		}));
	});
	assertNoDuplicateRunNames(sourced.map((s) => s.config));
	return sourced;
}
