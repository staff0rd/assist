import * as fs from "node:fs";

export function readVscodeJson(filePath: string): Record<string, unknown> {
	if (!fs.existsSync(filePath)) return {};
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	} catch {
		return {};
	}
}
