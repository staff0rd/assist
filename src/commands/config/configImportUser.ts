import chalk from "chalk";
import { getDb } from "../../shared/db/getDb";
import { readUserConfig } from "../../shared/db/readUserConfig";
import { updateUserConfig } from "../../shared/db/updateUserConfig";
import { loadGlobalConfigRaw, saveGlobalConfig } from "../../shared/loadConfig";
import { promptConfirm } from "../../shared/promptConfirm";
import { refreshRepoConfigCache } from "../../shared/refreshRepoConfigCache";
import { exitWithConfigErrors } from "./exitWithConfigErrors";
import { planUserConfigImport } from "./planUserConfigImport";
import { printUserConfigImportPlan } from "./printUserConfigImportPlan";
import { unsetNestedValue } from "./unsetNestedValue";

const DEFAULT_KEYS = ["advice.rules"];

export async function configImportUser(keys: string[]): Promise<void> {
	const chosen = keys.length > 0 ? keys : DEFAULT_KEYS;
	const yml = loadGlobalConfigRaw();
	const orm = await getDb();
	const plan = planUserConfigImport(yml, await readUserConfig(orm), chosen);
	printUserConfigImportPlan(plan);
	if (plan.errors.length > 0) exitWithConfigErrors(plan.errors);
	if (plan.imported.length === 0) {
		console.log("Nothing to import from ~/.assist.yml.");
		return;
	}

	const confirmed = await promptConfirm(
		`Write these to user (db) and remove ${plan.imported.join(", ")} from ~/.assist.yml?`,
		false,
	);
	if (!confirmed) {
		console.log("Nothing imported.");
		return;
	}

	const outcome = await updateUserConfig(orm, (current) => {
		const latest = planUserConfigImport(yml, current, plan.imported);
		return latest.errors.length > 0
			? { ok: false, errors: latest.errors }
			: { ok: true, config: latest.merged, result: undefined };
	});
	if (!outcome.ok) exitWithConfigErrors(outcome.errors);
	await refreshRepoConfigCache(orm);
	saveGlobalConfig(
		plan.imported.reduce(
			(config, key) => unsetNestedValue(config, key).config,
			yml,
		),
	);
	console.log(
		chalk.green(
			`Imported ${plan.imported.join(", ")} into user (db) and removed it from ~/.assist.yml`,
		),
	);
}
