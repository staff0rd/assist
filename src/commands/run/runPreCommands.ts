import { execSync } from "node:child_process";

export function runPreCommands(pre: string[], cwd?: string): void {
	for (const cmd of pre) {
		try {
			execSync(cmd, { stdio: "inherit", cwd });
		} catch (err) {
			const code =
				err && typeof err === "object" && "status" in err
					? (err.status as number)
					: 1;
			process.exit(code);
		}
	}
}
