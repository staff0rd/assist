import { getDb } from "../../shared/db/getDb";
import { readUserConfig } from "../../shared/db/readUserConfig";
import { loadGlobalConfigRaw } from "../../shared/loadConfig";
import { resolveSharedRepoBlock } from "../config/resolveSharedRepoBlock";
import type { AdviceScopeKind } from "./ruleScopeLocation";

async function readRaw(
	scope: AdviceScopeKind,
	cwd: string,
	globalConfigPath: string,
): Promise<Record<string, unknown>> {
	if (scope === "user-node") return loadGlobalConfigRaw(globalConfigPath);
	const orm = await getDb();
	if (scope === "user-db") return readUserConfig(orm);
	return (await resolveSharedRepoBlock(orm, undefined, cwd)).block;
}

export async function readAdviceRules(
	scope: AdviceScopeKind,
	cwd: string,
	globalConfigPath: string,
): Promise<unknown[]> {
	const advice = (await readRaw(scope, cwd, globalConfigPath)).advice as
		| { rules?: unknown }
		| undefined;
	return Array.isArray(advice?.rules) ? advice.rules : [];
}
