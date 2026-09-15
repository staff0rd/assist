import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export function adviceDir(): string {
	let current = dirname(fileURLToPath(import.meta.url));
	while (current !== dirname(current)) {
		const candidate = join(current, "claude", "advice");
		if (existsSync(candidate)) return candidate;
		current = dirname(current);
	}
	throw new Error("Could not locate the shipped claude/advice directory");
}
