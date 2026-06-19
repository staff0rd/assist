import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import { readVscodeJson } from "./readVscodeJson";

export function createExtensionsJson(): void {
	const extensionsPath = path.join(process.cwd(), ".vscode", "extensions.json");
	const existing = readVscodeJson(extensionsPath);
	const previous = Array.isArray(existing.recommendations)
		? (existing.recommendations as unknown[]).filter(
				(r) => r !== "biomejs.biome",
			)
		: [];
	const recommendations = previous.includes("oxc.oxc-vscode")
		? previous
		: [...previous, "oxc.oxc-vscode"];
	const extensions = { ...existing, recommendations };
	fs.writeFileSync(
		extensionsPath,
		`${JSON.stringify(extensions, null, "\t")}\n`,
	);
	console.log(chalk.green("Created .vscode/extensions.json"));
}
