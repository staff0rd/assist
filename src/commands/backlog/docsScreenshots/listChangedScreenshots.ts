import { execFileSync } from "node:child_process";
import { parseChangedPngs } from "./parseChangedPngs";

export function listChangedScreenshots(root: string, dir: string): Set<string> {
	try {
		return parseChangedPngs(
			execFileSync(
				"git",
				["status", "--porcelain", "--untracked-files=all", "--", dir],
				{ cwd: root, encoding: "utf8", stdio: "pipe" },
			),
		);
	} catch {
		return new Set();
	}
}
