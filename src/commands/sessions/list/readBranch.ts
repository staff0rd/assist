import { execFileSync } from "node:child_process";

export function readBranch(cwd: string): string | undefined {
	try {
		const branch = execFileSync(
			"git",
			["-C", cwd, "rev-parse", "--abbrev-ref", "HEAD"],
			{ encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 2_000 },
		).trim();
		return branch && branch !== "HEAD" ? branch : undefined;
	} catch {
		return undefined;
	}
}
