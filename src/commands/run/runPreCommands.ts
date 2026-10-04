import { execSync } from "node:child_process";

function writeCapturedOutput(error: object): void {
	for (const stream of ["stdout", "stderr"] as const) {
		const output = (error as Record<string, unknown>)[stream];
		if (output) process.stdout.write(output as Buffer);
	}
}

export function runPreCommands(
	pre: string[],
	cwd?: string,
	quiet?: boolean,
): void {
	for (const cmd of pre) {
		try {
			execSync(cmd, { stdio: quiet ? "pipe" : "inherit", cwd });
		} catch (error) {
			if (quiet && error && typeof error === "object")
				writeCapturedOutput(error);
			const code =
				error && typeof error === "object" && "status" in error
					? (error.status as number)
					: 1;
			process.exit(code);
		}
	}
}
