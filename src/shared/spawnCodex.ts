import { harnesses } from "./harnesses";
import { type SpawnResult, spawnInherit } from "./spawnInherit";

export function spawnCodex(
	prompt: string,
	options: { cwd?: string } = {},
): SpawnResult {
	const cwd = options.cwd ?? process.cwd();
	return spawnInherit(harnesses.codex.command, ["-C", cwd, prompt]);
}
