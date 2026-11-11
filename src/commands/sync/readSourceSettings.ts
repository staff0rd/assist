import * as fs from "node:fs";
import * as path from "node:path";
import { mergeSettings } from "./mergeSettings";

function readJson(file: string): Record<string, unknown> {
	return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function readSourceSettings(
	claudeDir: string,
	preferences?: boolean,
): Record<string, unknown> {
	const required = readJson(path.join(claudeDir, "settings.json"));
	if (!preferences) return required;
	return mergeSettings(
		required,
		readJson(path.join(claudeDir, "preferences.json")),
	);
}
