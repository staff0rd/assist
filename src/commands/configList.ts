import chalk from "chalk";
import { stringify as stringifyYaml } from "yaml";
import { describeConfigNode } from "../shared/describeConfigNode";
import { loadConfig } from "../shared/loadConfig";
import { maskConfigSecrets } from "../shared/maskConfigSecrets";
import { assistConfigSchema } from "../shared/types";

export function configList(): void {
	const config = maskConfigSecrets(
		loadConfig(),
		describeConfigNode(assistConfigSchema),
	);
	console.log(
		chalk.dim(
			"# Only the keys that are set; run assist config keys for every key and its default",
		),
	);
	console.log(stringifyYaml(config, { lineWidth: 0 }).trimEnd());
}
