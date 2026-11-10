import { execFileSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { harnesses } from "./harnesses";

function repoRoot(cwd: string): string | undefined {
	try {
		const commonDir = execFileSync(
			"git",
			["rev-parse", "--path-format=absolute", "--git-common-dir"],
			{ cwd, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
		).trim();
		return path.dirname(commonDir);
	} catch {
		return undefined;
	}
}

export function trustCodexProject(cwd: string | undefined): string | undefined {
	const root = repoRoot(cwd ?? process.cwd());
	if (!root) return undefined;
	const configPath = path.join(harnesses.codex.homeDir, "config.toml");
	const existing = fs.existsSync(configPath)
		? fs.readFileSync(configPath, "utf8")
		: "";
	const header = `[projects.${JSON.stringify(root)}]`;
	if (existing.includes(header)) return undefined;
	const base = existing.replace(/\s*$/, "");
	const entry = `${header}\ntrust_level = "trusted"\n`;
	fs.mkdirSync(path.dirname(configPath), { recursive: true });
	fs.writeFileSync(configPath, base ? `${base}\n\n${entry}` : entry);
	return root;
}
