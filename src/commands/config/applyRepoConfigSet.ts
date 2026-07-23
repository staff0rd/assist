import { loadGlobalConfigRaw, saveGlobalConfig } from "../../shared/loadConfig";
import { resolveNamedRepoWriteLabel } from "../../shared/resolveNamedRepoWriteLabel";
import { resolveRepoWriteLabel } from "../../shared/resolveRepoOverride";
import { getCurrentOrigin } from "../backlog/getCurrentOrigin";
import { setNestedValue } from "./setNestedValue";
import { validateConfig } from "./validateConfig";

export function applyRepoConfigSet(
	key: string,
	coerced: string | boolean,
	repoName?: string,
): string {
	const globalRaw = loadGlobalConfigRaw();
	const label =
		repoName === undefined
			? resolveRepoWriteLabel(globalRaw, getCurrentOrigin(process.cwd()))
			: resolveNamedRepoWriteLabel(globalRaw, repoName);
	const repos = isPlainObject(globalRaw.repos) ? { ...globalRaw.repos } : {};
	const existingBlock = isPlainObject(repos[label]) ? repos[label] : {};
	const updatedBlock = setNestedValue(existingBlock, key, coerced);
	validateConfig(updatedBlock, key);
	repos[label] = updatedBlock;
	saveGlobalConfig({ ...globalRaw, repos });
	return label;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
