import { harnesses } from "./harnesses";
import { piTerminalArgs } from "./piTerminalArgs";
import { type SpawnResult, spawnInherit } from "./spawnInherit";

export function spawnPi(
	prompt: string,
	options: { cwd?: string; model?: string } = {},
): SpawnResult {
	const cwd = options.cwd ?? process.cwd();
	const model = options.model ? ["--model", options.model] : [];
	return spawnInherit(
		harnesses.pi.command,
		[...piTerminalArgs, ...model, prompt],
		{
			cwd,
			env: { ASSIST_HARNESS: "pi" },
		},
	);
}
