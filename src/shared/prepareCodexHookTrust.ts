import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { MANAGED_BLOCK_BEGIN } from "../commands/sync/upsertManagedBlock";
import { harnesses } from "./harnesses";

const TIMEOUT_MS = 30_000;

let verified: string | undefined;

function fingerprint(configPath: string): string | undefined {
	try {
		const stat = fs.statSync(configPath);
		return `${stat.mtimeMs}:${stat.size}`;
	} catch {
		return undefined;
	}
}

function hasManagedBlock(configPath: string): boolean {
	try {
		return fs.readFileSync(configPath, "utf8").includes(MANAGED_BLOCK_BEGIN);
	} catch {
		return false;
	}
}

function runTrust() {
	const entry = process.argv[1];
	return entry
		? spawnSync(process.execPath, [entry, "codex-hook-trust"], {
				encoding: "utf8",
				timeout: TIMEOUT_MS,
			})
		: spawnSync("assist", ["codex-hook-trust"], {
				encoding: "utf8",
				timeout: TIMEOUT_MS,
				shell: process.platform === "win32",
			});
}

export function prepareCodexHookTrust(): string | undefined {
	const configPath = path.join(harnesses.codex.homeDir, "config.toml");
	if (!hasManagedBlock(configPath)) return undefined;
	if (verified && verified === fingerprint(configPath)) return undefined;
	const result = runTrust();
	if (result.status === 0) {
		verified = fingerprint(configPath);
		return undefined;
	}
	verified = undefined;
	return (
		result.stderr?.trim() ||
		`Could not trust Assist's Codex hooks: ${result.error?.message ?? `assist codex-hook-trust exited ${result.status}`}. Codex will ask you to review Assist's hooks; choose Review hooks and trust only the \`assist codex-hook\` entries.`
	);
}
