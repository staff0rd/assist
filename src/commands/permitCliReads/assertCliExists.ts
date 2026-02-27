import { execSync } from "node:child_process";

export function assertCliExists(cli: string): void {
	const binary = cli.split(/\s+/)[0];
	const opts = {
		encoding: "utf-8" as const,
		stdio: ["ignore", "pipe", "pipe"] as ["ignore", "pipe", "pipe"],
	};
	try {
		execSync(`command -v ${binary}`, opts);
	} catch {
		try {
			execSync(`where ${binary}`, opts);
		} catch {
			console.error(`CLI "${cli}" not found in PATH`);
			process.exit(1);
		}
	}
}
