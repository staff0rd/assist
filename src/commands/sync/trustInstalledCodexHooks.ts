import * as fs from "node:fs";
import * as path from "node:path";
import { harnesses } from "../../shared/harnesses";
import { assistCodexHookKeys } from "./assistCodexHookKeys";
import { trustAssistCodexHooks } from "./trustAssistCodexHooks";
import { MANAGED_BLOCK_BEGIN } from "./upsertManagedBlock";

export async function trustInstalledCodexHooks(
	sourcePath: string,
): Promise<number | undefined> {
	const configPath = path.join(harnesses.codex.homeDir, "config.toml");
	if (!fs.existsSync(configPath)) return undefined;
	const installed = fs.readFileSync(configPath, "utf8");
	const begin = installed.indexOf(MANAGED_BLOCK_BEGIN);
	if (begin === -1) return undefined;
	const expected = assistCodexHookKeys(
		installed.slice(0, begin),
		fs.readFileSync(sourcePath, "utf8"),
	);
	return trustAssistCodexHooks(configPath, expected);
}
