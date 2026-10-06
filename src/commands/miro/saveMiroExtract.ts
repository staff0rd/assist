import {
	getGlobalConfigPath,
	projectConfigPathFrom,
} from "../../shared/loadConfigFrom";
import { SHARED_REPO_CONFIG_SOURCE } from "../../shared/resolveRepoLayer";
import type { MiroExtractConfig } from "../../shared/types";
import { applyConfigSet } from "../config/applyConfigSet";
import { applySharedRepoConfigSet } from "../config/applySharedRepoConfigSet";
import { globalConfigFileLabel } from "../config/globalConfigFileLabel";
import { MiroExtractError } from "./MiroExtractError";
import type { MiroExtractOptions, MiroExtractPaths } from "./types";

async function saveToRepo(
	key: string,
	extract: MiroExtractConfig,
	repo: boolean | string,
	cwd: string,
): Promise<string> {
	const result = await applySharedRepoConfigSet(
		key,
		extract,
		typeof repo === "string" ? repo : undefined,
		cwd,
	);
	if (!result.ok) throw new MiroExtractError(result.errors.join("\n"));
	return `${SHARED_REPO_CONFIG_SOURCE} under repos.${result.label}`;
}

export async function saveMiroExtract(
	name: string,
	extract: MiroExtractConfig,
	options: MiroExtractOptions,
	paths: MiroExtractPaths = {},
): Promise<string> {
	const resolved = {
		cwd: paths.cwd ?? process.cwd(),
		globalConfigPath: paths.globalConfigPath ?? getGlobalConfigPath(),
	};
	if (options.repo !== undefined && !options.global)
		throw new MiroExtractError(
			"--repo writes to the global config; add -g (e.g. -g --repo)",
		);
	const key = `miro.extracts.${name}`;
	if (options.repo !== undefined)
		return saveToRepo(key, extract, options.repo, resolved.cwd);
	const result = applyConfigSet(
		key,
		extract,
		options.global ?? false,
		resolved.cwd,
		resolved.globalConfigPath,
	);
	if (!result.ok) throw new MiroExtractError(result.errors.join("\n"));
	return result.target === "global"
		? globalConfigFileLabel(resolved.globalConfigPath)
		: projectConfigPathFrom(resolved.cwd);
}
