import { execFileSync } from "node:child_process";

export function checkCliAvailable(cli: string): boolean {
	const binary = cli.split(/\s+/)[0];
	const [file, args] =
		process.platform === "win32"
			? ["where", [binary]]
			: ["sh", ["-c", 'command -v "$1"', "sh", binary]];
	try {
		execFileSync(file, args, {
			stdio: ["ignore", "pipe", "pipe"],
			windowsHide: true,
		});
		return true;
	} catch {
		return false;
	}
}
