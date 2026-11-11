import chalk from "chalk";
import { stringify as stringifyYaml } from "yaml";
import { describeConfigNode } from "../shared/describeConfigNode";
import {
	DatabaseConnectionError,
	toDatabaseConnectionError,
} from "../shared/db/DatabaseConnectionError";
import { loadConfig } from "../shared/loadConfig";
import { maskConfigSecrets } from "../shared/maskConfigSecrets";
import { type AssistConfig, assistConfigSchema } from "../shared/types";
import {
	dbBackedKeysIn,
	withDbBackedConfigValues,
} from "./config/withDbBackedConfigValues";

async function loadListedConfig(): Promise<{
	config: AssistConfig;
	dbError?: string;
}> {
	const fileConfig = loadConfig();
	try {
		return {
			config: await withDbBackedConfigValues(fileConfig, dbBackedKeysIn()),
		};
	} catch (error) {
		const reported = toDatabaseConnectionError(error);
		if (!(reported instanceof DatabaseConnectionError)) throw error;
		return { config: fileConfig, dbError: reported.message };
	}
}

export async function configList(): Promise<void> {
	const { config, dbError } = await loadListedConfig();
	console.log(
		chalk.dim(
			"# Only the keys that are set; run assist config keys for every key and its default",
		),
	);
	if (dbError)
		console.log(
			chalk.yellow(
				`# DB-backed values could not be loaded; showing file-backed config only.\n# ${dbError.replaceAll("\n", "\n# ")}`,
			),
		);
	const masked = maskConfigSecrets(
		config,
		describeConfigNode(assistConfigSchema),
	);
	console.log(stringifyYaml(masked, { lineWidth: 0 }).trimEnd());
}
