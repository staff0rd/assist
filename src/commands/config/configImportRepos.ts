import chalk from "chalk";
import { getDb } from "../../shared/db/getDb";
import { listRepoConfigs } from "../../shared/db/listRepoConfigs";
import { saveRepoConfig } from "../../shared/db/saveRepoConfig";
import { loadGlobalConfigRaw, saveGlobalConfig } from "../../shared/loadConfig";
import { promptConfirm } from "../../shared/promptConfirm";
import { refreshRepoConfigCache } from "../../shared/refreshRepoConfigCache";
import { exitWithConfigErrors } from "./exitWithConfigErrors";
import { planRepoConfigImport } from "./planRepoConfigImport";
import { printRepoConfigImportPlan } from "./printRepoConfigImportPlan";

export async function configImportRepos(): Promise<void> {
	const { repos: ymlRepos, ...rest } = loadGlobalConfigRaw();
	if (!isPlainObject(ymlRepos) || Object.keys(ymlRepos).length === 0) {
		console.log("No repos: in ~/.assist.yml to import.");
		return;
	}

	const orm = await getDb();
	const plans = planRepoConfigImport(ymlRepos, await listRepoConfigs(orm));
	printRepoConfigImportPlan(plans);
	const errors = plans.flatMap((plan) => plan.errors);
	if (errors.length > 0) exitWithConfigErrors(errors);

	const confirmed = await promptConfirm(
		"Write these keys to the shared db and remove repos: from ~/.assist.yml?",
		false,
	);
	if (!confirmed) {
		console.log("Nothing imported.");
		return;
	}

	const changed = plans.filter((plan) => plan.changes.length > 0);
	for (const plan of changed)
		await saveRepoConfig(orm, plan.dbKey, plan.merged);
	await refreshRepoConfigCache(orm);
	saveGlobalConfig(rest);
	const keys = changed.reduce((n, plan) => n + plan.changes.length, 0);
	console.log(
		chalk.green(
			`Imported ${keys} key(s) across ${changed.length} repo(s) and removed repos: from ~/.assist.yml`,
		),
	);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
