import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";

function loadKnipConfig(knipJsonPath: string): Record<string, unknown> {
	if (existsSync(knipJsonPath)) {
		return JSON.parse(readFileSync(knipJsonPath, "utf-8"));
	}
	return { $schema: "https://unpkg.com/knip@5/schema.json" };
}

export function addToKnipIgnoreBinaries(cwd: string, binary: string): void {
	const knipJsonPath = join(cwd, "knip.json");
	try {
		const knipConfig = loadKnipConfig(knipJsonPath);
		const ignoreBinaries: string[] =
			(knipConfig.ignoreBinaries as string[]) ?? [];
		if (!ignoreBinaries.includes(binary)) {
			knipConfig.ignoreBinaries = [...ignoreBinaries, binary];
			writeFileSync(
				knipJsonPath,
				`${JSON.stringify(knipConfig, null, "\t")}\n`,
			);
			console.log(chalk.dim(`Added '${binary}' to knip.json ignoreBinaries`));
		}
	} catch {
		console.log(chalk.yellow("Warning: Could not update knip.json"));
	}
}
