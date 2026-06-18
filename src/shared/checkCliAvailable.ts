import { execSync } from "node:child_process";

export function checkCliAvailable(cli: string): boolean {
	const binary = cli.split(/\s+/)[0];
	const opts = {
		encoding: "utf8" as const,
		stdio: ["ignore", "pipe", "pipe"] as ["ignore", "pipe", "pipe"],
	};
	try {
		execSync(`command -v ${binary}`, opts);
		return true;
	} catch {
		try {
			execSync(`where ${binary}`, opts);
			return true;
		} catch {
			return false;
		}
	}
}
