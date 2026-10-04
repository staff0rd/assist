import { readFile } from "node:fs/promises";
import { join } from "node:path";
import chalk from "chalk";
import { criteriaExtensionDir } from "./criteriaExtensionDir";
import { latestUpdateLink } from "./latestUpdateLink";

type UpdateUrlManifest = {
	browser_specific_settings: { gecko: { update_url: string } };
};

export async function printCriteriaExtensionUrl(): Promise<void> {
	const manifest = await readFile(
		join(criteriaExtensionDir(), "manifest.json"),
		"utf8",
	);
	const { update_url } = (JSON.parse(manifest) as UpdateUrlManifest)
		.browser_specific_settings.gecko;
	const response = await fetch(update_url);
	const link = response.ok
		? latestUpdateLink(manifest, await response.text())
		: undefined;
	if (!link) {
		console.log(chalk.red(`no signed build found in ${update_url}`));
		process.exitCode = 1;
		return;
	}
	console.log(link);
}
