import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const PIN_FILES = [".node-version", ".nvmrc"];

type NodePin = { file: string; spec: string };

function readPin(file: string): string | undefined {
	if (!existsSync(file)) return undefined;
	try {
		return readFileSync(file, "utf8")
			.split(/\r?\n/)
			.map((line) => line.trim())
			.find((line) => line && !line.startsWith("#"));
	} catch {
		return undefined;
	}
}

export function findNodePin(dir: string, root: string): NodePin | undefined {
	const top = resolve(root);
	let current = resolve(dir);
	for (;;) {
		for (const name of PIN_FILES) {
			const file = join(current, name);
			const spec = readPin(file);
			if (spec) return { file, spec };
		}
		const parent = dirname(current);
		if (current === top || parent === current) return undefined;
		current = parent;
	}
}
