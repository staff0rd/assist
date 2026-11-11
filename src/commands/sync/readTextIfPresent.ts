import * as fs from "node:fs";

export function readTextIfPresent(target: string): string | undefined {
	try {
		return fs.readFileSync(target, "utf8");
	} catch {
		return undefined;
	}
}
