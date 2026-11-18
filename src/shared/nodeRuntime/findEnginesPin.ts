import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { NodePin } from "./findNodePin";

function readEngines(file: string): string | undefined {
	try {
		const pkg = JSON.parse(readFileSync(file, "utf8"));
		const range = pkg?.engines?.node;
		return typeof range === "string" && range.trim() ? range.trim() : undefined;
	} catch {
		return undefined;
	}
}

export function findEnginesPin(dir: string, root: string): NodePin | undefined {
	const top = resolve(root);
	let current = resolve(dir);
	for (;;) {
		const file = join(current, "package.json");
		const spec = readEngines(file);
		if (spec) return { file, spec };
		const parent = dirname(current);
		if (current === top || parent === current) return undefined;
		current = parent;
	}
}
