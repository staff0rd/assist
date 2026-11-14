import { findRepoRoot } from "../../shared/findRepoRoot";
import { getDb } from "../../shared/db/getDb";
import { readUserConfig } from "../../shared/db/readUserConfig";
import { loadGlobalConfigRaw } from "../../shared/loadConfig";
import { getGlobalConfigPath } from "../../shared/loadConfigFrom";
import { globalConfigFileLabel } from "../config/globalConfigFileLabel";
import { resolveSharedRepoBlock } from "../config/resolveSharedRepoBlock";
import { adviceRulesOf } from "./adviceRulesOf";
import { claudeMdRuleScopes } from "./claudeMdRuleScopes";
import type { RuleScope } from "./types";

async function dbScopes(cwd: string): Promise<RuleScope[]> {
	const userDb: RuleScope = {
		id: "user-db",
		kind: "user-db",
		name: "User (db)",
		depth: 0,
		rules: [],
	};
	const repoDb: RuleScope = {
		id: "repo-db",
		kind: "repo-db",
		name: "Repo (db)",
		depth: 0,
		rules: [],
	};
	try {
		const orm = await getDb();
		const { label, block } = await resolveSharedRepoBlock(orm, undefined, cwd);
		return [
			{ ...userDb, rules: adviceRulesOf(await readUserConfig(orm)) },
			{ ...repoDb, label, rules: adviceRulesOf(block) },
		];
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		return [
			{ ...userDb, error: message },
			{ ...repoDb, error: message },
		];
	}
}

export async function readRuleScopes(
	cwd: string,
	globalConfigPath: string = getGlobalConfigPath(),
): Promise<RuleScope[]> {
	const [userDb, repoDb] = await dbScopes(cwd);
	const userNode: RuleScope = {
		id: "user-node",
		kind: "user-node",
		name: "User (node)",
		label: globalConfigFileLabel(globalConfigPath),
		depth: 0,
		rules: adviceRulesOf(loadGlobalConfigRaw(globalConfigPath)),
	};
	return [
		userDb,
		userNode,
		repoDb,
		...claudeMdRuleScopes(findRepoRoot(cwd) ?? cwd),
	];
}
