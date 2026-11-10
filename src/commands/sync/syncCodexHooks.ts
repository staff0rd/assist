import * as fs from "node:fs";
import * as path from "node:path";
import { harnesses } from "../../shared/harnesses";
import { assistCodexHookKeys } from "./assistCodexHookKeys";
import { trustAssistCodexHooks } from "./trustAssistCodexHooks";
import { MANAGED_BLOCK_BEGIN, upsertManagedBlock } from "./upsertManagedBlock";

export async function syncCodexHooks(sourcePath: string): Promise<void> {
	const body = fs.readFileSync(sourcePath, "utf8");
	const configPath = path.join(harnesses.codex.homeDir, "config.toml");
	const existing = fs.existsSync(configPath)
		? fs.readFileSync(configPath, "utf8")
		: "";
	const next = upsertManagedBlock(existing, body);
	fs.mkdirSync(path.dirname(configPath), { recursive: true });
	fs.writeFileSync(configPath, next);
	console.log(
		"Registered assist codex-hook in ~/.codex/config.toml (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse, PermissionRequest, Stop)",
	);
	const expected = assistCodexHookKeys(
		next.slice(0, next.indexOf(MANAGED_BLOCK_BEGIN)),
		body,
	);
	try {
		const trusted = await trustAssistCodexHooks(configPath, expected);
		console.log(
			trusted
				? `Trusted ${trusted} assist codex-hook definition(s) in Codex`
				: "Assist's codex-hook definitions are already trusted in Codex",
		);
	} catch (error) {
		console.error(
			`Could not trust Assist's Codex hooks: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
