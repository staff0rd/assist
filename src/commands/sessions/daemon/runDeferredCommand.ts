import { spawn } from "node:child_process";
import { deferredRunEnv } from "../shared/deferredRunEnv";

type DeferredCommand = {
	argv: string[];
	stdin?: string;
	cwd: string;
	env: Record<string, string>;
};

export type DeferredResult = { output: string; exitCode: number };

export function runDeferredCommand(
	command: DeferredCommand,
	onDone: (result: DeferredResult) => void,
	spawnChild: typeof spawn = spawn,
): number | undefined {
	const child = spawnChild(
		process.execPath,
		[process.argv[1], ...command.argv],
		{
			cwd: command.cwd,
			env: { ...command.env, [deferredRunEnv]: "1" },
			stdio: ["pipe", "pipe", "pipe"],
			windowsHide: true,
		},
	);
	let output = "";
	const collect = (chunk: Buffer | string) => {
		output += chunk.toString();
	};
	child.stdout?.on("data", collect);
	child.stderr?.on("data", collect);
	child.on("error", (error) => {
		output += `${error.message}\n`;
	});
	child.on("close", (code) => onDone({ output, exitCode: code ?? 1 }));
	child.stdin?.on("error", () => {});
	child.stdin?.end(command.stdin ?? "");
	return child.pid;
}
