import { harnesses } from "./harnesses";
import { type SpawnResult, spawnInherit } from "./spawnInherit";

export function spawnPi(
	prompt: string,
	options: { cwd?: string } = {},
): SpawnResult {
	const cwd = options.cwd ?? process.cwd();
	return spawnInherit(harnesses.pi.command, [prompt], { cwd });
}
