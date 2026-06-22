import * as fs from "node:fs";
import * as path from "node:path";
import chalk from "chalk";
import { readVscodeJson } from "./readVscodeJson";

export function createSettingsJson(): void {
	const settingsPath = path.join(process.cwd(), ".vscode", "settings.json");
	const existing = readVscodeJson(settingsPath);
	const settings = {
		...existing,
		"editor.defaultFormatter": "oxc.oxc-vscode",
		"editor.formatOnSave": true,
		"editor.codeActionsOnSave": {
			...existingCodeActions(existing["editor.codeActionsOnSave"]),
			"source.fixAll.oxc": "explicit",
		},
	};
	fs.writeFileSync(settingsPath, `${JSON.stringify(settings, null, "\t")}\n`);
	console.log(chalk.green("Created .vscode/settings.json"));
}

function existingCodeActions(actions: unknown): Record<string, unknown> {
	if (!actions || typeof actions !== "object") return {};
	const { "source.organizeImports.oxc": _removed, ...rest } = actions as Record<
		string,
		unknown
	>;
	return rest;
}
