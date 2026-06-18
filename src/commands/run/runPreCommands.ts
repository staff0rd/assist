import { execSync } from "node:child_process";

export function runPreCommands(pre: string[], cwd?: string): void {
	for (const cmd of pre) {
		try {
			execSync(cmd, { stdio: "inherit", cwd });
		} catch (error) {
			const code =
				error && typeof error === "object" && "status" in error
					? (error.status as number)
					: 1;
			process.exit(code);
		}
	}
}
